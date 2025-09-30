import { NextRequest, NextResponse } from 'next/server';
import { sendVtu, requeryTransaction } from '@/lib/vtpass';

export async function POST(req: NextRequest) {
  try {
    // Get the authorization token
    const token = req.cookies.get('accessToken')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const body = await req.json();
    const { phone, amount } = body;
    
    // Validate inputs
    if (!phone || !amount) {
      return NextResponse.json(
        { error: 'Phone number and amount are required' }, 
        { status: 400 }
      );
    }
    
    // Generate a unique request ID for this transaction
    // Format: YYYYMMDDHHMMSSxxxxx (where xxxxx is a random 5-digit number)
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const random = Math.floor(10000 + Math.random() * 90000); // 5-digit random number
    const request_id = `${year}${month}${day}${hours}${minutes}${seconds}${random}`;
    
    console.log(`Processing MTN VTU purchase: Phone=${phone}, Amount=${amount}, RequestID=${request_id}`);
    
    // Send the VTU request to the payment provider
    const result = await sendVtu({
      serviceID: 'mtn', 
      phone, 
      amount,
      request_id
    });
    
    console.log('VTPass API response:', result);
    
    // Check if the result has the expected format and success code
    if (result && result.code === '000') {
      return NextResponse.json({ 
        success: true,
        message: result.response_description || 'Airtime purchase successful',
        transaction: {
          id: request_id,
          transactionId: result.content?.transactions?.transactionId,
          phone,
          amount,
          provider: 'MTN',
          status: result.content?.transactions?.status,
          date: result.transaction_date || new Date().toISOString()
        },
        raw: result // Include the raw response for debugging
      });
    } else {
      // If the result doesn't have the expected success code
      const errorMsg = result?.response_description || 'Transaction processing failed';
      console.error('VTPass error response:', errorMsg, result);
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }
  } catch (error: any) {
    console.error('VTU Error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to process airtime purchase',
      }, 
      { status: 500 }
    );
  }
}

// Add a route to query transaction status
export async function GET(req: NextRequest) {
  try {
    // Get the authorization token
    const token = req.cookies.get('accessToken')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get request_id from query params
    const { searchParams } = new URL(req.url);
    const request_id = searchParams.get('request_id');
    
    if (!request_id) {
      return NextResponse.json(
        { error: 'request_id parameter is required' }, 
        { status: 400 }
      );
    }
    
    console.log(`Requerying transaction status for request_id: ${request_id}`);
    
    // Query the transaction status
    const result = await requeryTransaction({ request_id });
    
    console.log('VTPass requery response:', result);
    
    if (result && result.code === '000') {
      return NextResponse.json({ 
        success: true,
        status: result.content?.transactions?.status || 'unknown',
        message: result.response_description,
        transaction: {
          id: request_id,
          transactionId: result.content?.transactions?.transactionId,
          status: result.content?.transactions?.status,
          amount: result.amount,
          date: result.transaction_date
        },
        raw: result
      });
    } else {
      const errorMsg = result?.response_description || 'Failed to query transaction status';
      console.error('VTPass requery error:', errorMsg, result);
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Transaction requery error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to query transaction status',
      }, 
      { status: 500 }
    );
  }
}
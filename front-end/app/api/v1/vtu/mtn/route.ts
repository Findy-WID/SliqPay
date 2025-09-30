import { NextRequest, NextResponse } from 'next/server';
import { sendVtu } from '@/lib/vtpass';
import { v4 as uuidv4 } from 'uuid';

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
    const request_id = uuidv4();
    
    // Send the VTU request to the payment provider
    const result = await sendVtu({
      serviceID: 'mtn', 
      phone, 
      amount,
      request_id
    });
    
    // Return the result
    return NextResponse.json({ 
      success: true,
      message: 'Airtime purchase successful',
      transaction: {
        id: request_id,
        phone,
        amount,
        provider: 'MTN',
        date: new Date().toISOString()
      }
    });
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
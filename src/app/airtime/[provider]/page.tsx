export default function providers( {params}: {params: { provider: string }}) {
    return (
        <div><h1>Provider: {params.provider}</h1></div>
    )
}
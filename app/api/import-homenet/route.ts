export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get("secret")

  if (secret !== process.env.IMPORT_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    })
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: "Import route is working",
    }),
    { status: 200 }
  )
}
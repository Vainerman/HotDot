import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://flasker-jc14.onrender.com/process_image";

async function proxy(req: NextRequest, init: RequestInit) {
  try {
    const res = await fetch(API_URL + req.nextUrl.search, init);
    const body = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "application/json";
    return new NextResponse(body, {
      status: res.status,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("Proxy error", err);
    return NextResponse.json({ error: "Proxy request failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return proxy(req, { method: "GET" });
}

export async function POST(req: NextRequest) {
  const body = await req.formData();
  return proxy(req, { method: "POST", body });
}


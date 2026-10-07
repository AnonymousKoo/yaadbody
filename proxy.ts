import { NextResponse } from "next/server";

export function proxy() {
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  return new NextResponse("Not Found", {
    status: 404,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

export const config = {
  matcher: ["/ops/:path*"],
};

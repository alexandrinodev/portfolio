import { NextRequest, NextResponse } from "next/server"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const locale = pathname.match(/^\/(pt|en)(?:\/|$)/)?.[1]

  if (locale) {
    const response = NextResponse.next()
    response.cookies.set("language", locale, {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    })
    return response
  }

  const savedLanguage = request.cookies.get("language")?.value
  const language = savedLanguage === "en" ? "en" : "pt"
  const url = request.nextUrl.clone()
  url.pathname = `/${language}${pathname === "/" ? "" : pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
}

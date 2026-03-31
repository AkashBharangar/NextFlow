import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
});

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/canvas/:path*",
    "/api/workflows",
    "/api/workflows/:path*",
    "/api/runs/:path*",
  ],
};

import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "./providers/AuthProvider";

export const metadata: Metadata = {
    title: "Shop Review",
    description: "A beautiful shop review website",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <AuthProvider>

                        {children}

                </AuthProvider>
            </body>
        </html>
    );
}

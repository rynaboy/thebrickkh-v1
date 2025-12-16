  import type { Metadata } from "next";
  import { DM_Sans } from "next/font/google";

  import "../globals.css"
  import { NavBar } from "@/components/core";
  import { LanguageProvider } from '@/components/context/LanguageContext';
  import '../../../public/fonts/style.css';
  import axios from "axios";

  const dmSans = DM_Sans({
    subsets: ["latin"],
    variable: "--font-dm-sans",
    display: "swap",
  });


  export async function generateMetadata({ params }: { params: { projectName: string } }): Promise<Metadata> {
    try {
      const response = await axios.get(`https://${params.projectName}.tsdsolution.net/api/DriverController/setting`);
      const data = response.data;
      const logoUrl = data.logo 
        ? `https://${params.projectName}.tsdsolution.net/assets/uploads/logos/${data.logo}`
        : "/default-icon.png";
      return {
        title: data.site_name || "Default Title",
        icons: logoUrl
      };
    } catch (error) {
      console.error("Error fetching metadata:", error);
      // Return default metadata or handle the error as per your requirement
      return {
        title: "Default Title",
        icons: "/default-icon.png"
      };
    }
  }

  export default function RootLayout({params,children,}: Readonly<{
    params: { projectName: string }
    children: React.ReactNode;
  }>) {
    return (
      <html lang="en" className={`scroll-smooth ${dmSans.variable}`}>
        <body className="m-auto max-w-[575px] font-sans">
          <div className=" h-screen bg-gray-100  overflow-auto max-w-[575px] w-full ">
          <LanguageProvider>
          {children}
        </LanguageProvider>
          </div>
        </body>
      </html>
    );
  }
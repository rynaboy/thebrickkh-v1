  import type { Metadata } from "next";

  import "../globals.css"
  import { NavBar } from "@/components/core";
  import { LanguageProvider } from '@/components/context/LanguageContext';
  import '../../../public/fonts/style.css';
  import axios from "axios";


  export async function generateMetadata({ params }: { params: { projectName: string } }): Promise<Metadata> {
    try {
      const response = await axios.get(`https://${params.projectName}.tsdsolution.net/api/DriverController/setting`);
      const data = response.data;
      return {
        title: data.site_name,
        icons: `https://${params.projectName}.tsdsolution.net/assets/uploads/logos/${data.logo}`
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
      <html lang="en" className="scroll-smooth">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" rel="stylesheet" />
        </head>
        <body className="m-auto max-w-[575px]">
          <div className=" h-screen bg-gray-100  overflow-auto max-w-[575px] w-full ">
          <LanguageProvider>
          {children}
        </LanguageProvider>
          </div>
        </body>
      </html>
    );
  }
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DiscordLogoIcon, InstagramLogoIcon } from "@radix-ui/react-icons";
// TiktokLogoIcon doesn't exist in @radix-ui/react-icons
// Using custom SVG for TikTok icon instead of importing from libraries

export default function Footer() {
  return (
    <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
      <p className="text-xs text-gray-500 dark:text-gray-400">© 2025 StoicForge. All rights reserved.</p>
      
      <nav className="sm:ml-auto flex gap-4 sm:gap-6 items-center">
        <Link className="text-xs hover:underline underline-offset-4" href="#">
          Terms of Service
        </Link>
        <Link className="text-xs hover:underline underline-offset-4" href="#">
          Privacy
        </Link>
        
        {/* Social Media Buttons */}
        <div className="flex gap-2 items-center ml-2">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-full">
            <Link href="https://discord.gg/zCVscavkFc" target="_blank" aria-label="Discord">
              <DiscordLogoIcon className="h-4 w-4" />
            </Link>
          </Button>
          
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-full">
            <Link href="https://instagram.com/stoicforge_" target="_blank" aria-label="Instagram">
              <InstagramLogoIcon className="h-4 w-4" />
            </Link>
          </Button>
          
          {/* <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-full">
            <Link href="https://tiktok.com/@stoic_forge" target="_blank" aria-label="TikTok">
              <TikTok className="h-4 w-4" />
            </Link>
          </Button> */}
          
          {/* TikTok Button */}
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-full">
            <Link href="https://tiktok.com/@stoic_forge" target="_blank" aria-label="TikTok">
              {/* TikTok icon - using SVG directly since it's not in Radix icons */}
              <svg 
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
                <path d="M15 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                <path d="M15 8v8a4 4 0 0 1-4 4" />
                <line x1="15" y1="4" x2="15" y2="16" />
              </svg>
            </Link>
          </Button>
        </div>
      </nav>
    </footer>
  );
}
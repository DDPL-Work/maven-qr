import { HiLocationMarker } from "react-icons/hi";
import logo from '../assets/maven-logo.svg'

export default function Header({ companyName }) {
  return (
    <div className="bg-white border-b border-[#d8e4f4] px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-2.5">
       <img src={logo} alt="" />
      </div>

      <div className="flex items-center gap-2 text-[13px] text-[#8fa3bf]">
        <HiLocationMarker className="w-4 h-4" />
        Companies · {companyName}
      </div>
    </div>
  );
}

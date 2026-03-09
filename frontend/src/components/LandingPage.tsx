import NavBar from "./NavBar";
import piggy from "../assets/pngs/piggy3 (2).png"

function LandingPage() {

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-c1 via-c3 to-c6">
      <NavBar></NavBar>
      <div className="flex px-25 justify-between">
        <div>
        <h1 className="text-[100px] min-h-screen flex  items-center text-c6 font-semibold leading-relaxed font-mono">
        TRADE. <br/> MULTIPLY. <br/> MAX WITHDRAW. 
        </h1>
      </div>
      <div className="text-[100px] min-h-screen flex  flex-col items-end justify-center text-c6 font-semibold leading-relaxed font-mono">
        <h1>SHARE PRICE</h1>
        <h1>PIGGYvault</h1>
        <h1>TRADE</h1>
      </div>
      </div>
      <div className="h-[68px] bg-c1">

      </div>
    </div>
  )
}

export default LandingPage;
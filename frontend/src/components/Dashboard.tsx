import NavBar from "./NavBar";

function Dashboard() {

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-c1 via-c3 to-c6 pt-30 px-24">
      <NavBar></NavBar>
      <div className="flex justify-between items-center gap-2 h-[80vh] bg-c5/10 backdrop-blur-md
rounded-3xl shadow-lg text-c6 p-2">
        <div className=" h-[78vh] bg-c2/10 rounded-3xl w-[45vw]">

        </div>
        <div className=" h-[78vh] bg-c2/10 rounded-3xl w-[45vw]">

        </div>
      </div>
    </div>
  )
}

export default Dashboard;
function NavBar() {
    return (
        <nav className="fixed top-10 left-1/2 -translate-x-1/2 z-50
flex items-center justify-between
w-[90%] px-6 h-15
bg-c5/10 backdrop-blur-md
rounded-3xl shadow-lg text-c6 font-medium text-lg">
            <a>PIGGYvault</a>
            <span>address...</span>
            <button>Connect</button>
        </nav>
    )
}

export default NavBar;
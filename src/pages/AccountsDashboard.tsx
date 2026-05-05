import { Navbar } from "../components/Navbar"
import { AccountsLayout } from "../DashBoards/dashboardDesign/AccountsDashboard/AccountsLayout"

export const AccountsDashBoard = () => {
  return (
    <div className="h-screen mt-20">
      <Navbar/>
      <AccountsLayout />    
    </div>
  )
}

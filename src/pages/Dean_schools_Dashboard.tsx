import { Navbar } from "../components/Navbar"
import { DeanSchoolsLayout } from "../DashBoards/dashboardDesign/Dean_of_schools/Dean_Schools_Layout"

export const DeanSchoolDashBoard = () => {
  return (
    <div className="h-screen mt-20">
      <Navbar/>
      <DeanSchoolsLayout />    
    </div>
  )
}

import { Navbar } from "../components/Navbar"
import { DeanStudentsLayout } from "../DashBoards/dashboardDesign/Dean_of_student/Dean_Students_Layout"


export const DeanStudentDashBoard = () => {
  return (
    <div className="h-screen mt-20">
      <Navbar/>
      <DeanStudentsLayout />    
    </div>
  )
}

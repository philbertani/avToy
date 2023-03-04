import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../features";
import ResponsiveAppBar from "./ResponsiveAppBar";

const Navbar = () => {
  
  const isLoggedIn = useSelector((state) => !!state.auth.me.id);
  const {audioPlayerFile} = useSelector( state => state.singleProject)

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutAndRedirectHome = () => {
    dispatch(logout());
    navigate("/login");
  };

  const numProjects = useSelector((state) => state.allProjects.length);

  let pages;
  let pageLabels;

/*   if (isLoggedIn) {
    pages = ["projects"];
    pageLabels = [`Active Projects (${numProjects})`];
  } else { */

  {
    pages = [];
    pageLabels = [];
  }

  const homeTitle = "";
  const settings = ["Blank"];  //used to be "LogOut"

  //isLoggedIn is permanently set to true by setting initialstate
  //in authSlice to not null
  return (
    <div>
      <ResponsiveAppBar
        sx={{ zIndex: "-1" }}
        isLoggedIn={isLoggedIn}
        pages={pages}
        pageLabels={pageLabels}
        homeTitle={homeTitle}
        settings={settings}
        logoutAndRedirectHome={logoutAndRedirectHome}
        currentAudioPlaying={audioPlayerFile}
      />
      {/* <br /> */}
      {/* <br /> */}
      {/* <br /> */}
    </div>
  );
};

export default Navbar;

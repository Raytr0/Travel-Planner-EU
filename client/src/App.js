import Login from "./components/auth/login";
import Register from "./components/auth/register";

import Header from "./components/header";
import Home from "./components/home";

import Policies from "./components/policies";
import LimitedApp from "./components/limitedApp";
import Settings from "./components/settings";
import Lists from "./components/lists";
import Admin from "./components/admin";
import Verify from "./components/unverified";
import Reviews from "./components/reviews";

import { AuthProvider } from "./contexts/authContext";
import { useRoutes } from "react-router-dom";

function App() {
  const routesArray = [
    {
      path: "*",
      element: <Policies />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/home",
      element: <Home />,
    },
    {
      path: "/policies",
        element: <Policies />
    },
    {
      path: "/limitedApp",
        element: <LimitedApp />
    },
    {
      path: "/settings",
        element: <Settings />
    },
    {
      path: "/lists",
      element: <Lists/>
    },
    {
      path: "/admin",
      element: <Admin/>
    },
    {
      path: "/verify",
        element: <Verify/>
    },
    {
      path: "/reviews",
        element: <Reviews/>
    }

  ];
  let routesElement = useRoutes(routesArray);
  return (
      <AuthProvider>
        <Header />
        <div className="w-full h-screen flex flex-col">{routesElement}</div>
      </AuthProvider>
  );
}

export default App;
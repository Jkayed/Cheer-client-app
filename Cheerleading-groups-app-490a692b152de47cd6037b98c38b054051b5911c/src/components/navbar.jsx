import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@nextui-org/react";
import { doSignOut } from "../firebase/auth";
import { useAuth } from "../contexts/authContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/thumb_IMG_0520.jpeg"
import "../App.css"
function NavigationBar() {
  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuItems = [
    "Profile",
    "Dashboard",
    "Activity",
    "Analytics",
    "System",
    "Deployments",
    "My Settings",
    "Team Settings",
    "Help & Feedback",
    "Log Out",
  ];

  const handleSignOut = async () => {
    await doSignOut();
    navigate("/login"); // Redirect to login after signing out
  };

  return (
    <>
      {/* First Navbar: Visible only on larger screens */}
      <Navbar className="bg-[#ffff] p-4 hidden sm:flex">
        <NavbarBrand>
        <Link color="foreground" href="/find-group">
        <img src={logo} className="logo"/>
            </Link>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link color="foreground" href="/find-group">
              Find a Group
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link color="foreground" href="/managed-groups">
              Manage Groups
            </Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end">
          {userLoggedIn ? (
            <NavbarItem className="hidden lg:flex">
              <Button color="error" onClick={handleSignOut}>
                Sign out
              </Button>
            </NavbarItem>
          ) : null}
          {!userLoggedIn ? (
            <NavbarItem>
              <Button as={Link} color="primary" href="register" variant="flat">
                Sign Up
              </Button>
            </NavbarItem>
          ) : null}
        </NavbarContent>
      </Navbar>

      {/* Second Navbar: Visible only on smaller screens */}
      <Navbar onMenuOpenChange={setIsMenuOpen} className="sm:hidden">
        <NavbarContent>
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="sm:hidden"
          />
          <NavbarBrand>
          <Link color="foreground" href="/find-group">
          <img src={logo} className="logo-mobile"/>
            </Link>
          </NavbarBrand>
        </NavbarContent>

        {/* Central Content */}
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link color="foreground" href="/find-group">
              Find a Group
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link color="foreground" href="/managed-groups">
              Manage Groups
            </Link>
          </NavbarItem>
        </NavbarContent>

        {/* Right-Side Content */}
        <NavbarContent justify="end">
          {userLoggedIn ? (
            <NavbarItem>
              <Button color="error" onClick={handleSignOut}>
                Sign out
              </Button>
            </NavbarItem>
          ) : (
            <NavbarItem>
              <Button as={Link} color="primary" href="register" variant="flat">
                Sign Up
              </Button>
            </NavbarItem>
          )}
        </NavbarContent>

        {/* Mobile Menu Content */}
        <NavbarMenu>
          <NavbarMenuItem>
            <Link color="foreground" href="/find-group">
              Find a Group
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link color="foreground" href="/managed-groups">
              Manage Groups
            </Link>
          </NavbarMenuItem>
        </NavbarMenu>
      </Navbar>
    </>
  );
}

export default NavigationBar;

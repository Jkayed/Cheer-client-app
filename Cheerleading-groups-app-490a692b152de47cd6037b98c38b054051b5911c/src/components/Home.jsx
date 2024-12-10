import FindGroup from "./FindGroup";
import ShowLocalGroups from "./showLocalGroups";
import axios from "axios";
function Home() {
  function testDatabase() {
    axios
      .post("https://cheer-client-app-backend.onrender.com/contact", {
        firstName: "Test",
        lastName: "Test",
        email: "Test",
        phone: "Test",
        country: "Test",
        city: "Test",
        state: "Test",
        zip: "Test",
      })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  return (
    <>
      <FindGroup />
    </>
  );
}

export default Home;

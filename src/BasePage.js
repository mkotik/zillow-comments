import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

const BasePage = () => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(
      "/homedetails/1155-Sandpiper-St-G6-Naples-FL-34112/54181396_zpid/"
    );
  };
  return (
    <div>
      <h1>Welcome to the Zillow Comment Page</h1>
      <Button variant="contained" color="primary" onClick={handleNavigate}>
        Go to Comments
      </Button>
    </div>
  );
};

export default BasePage;

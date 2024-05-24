import React from 'react'
import { createContext } from "react";

const userContext = React.createContext([]);
const dataContext = React.createContext(null);

const Contexts = {
  userContext: userContext,
  dataContext: dataContext
}

export default Contexts;
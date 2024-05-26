import React from 'react'

const userContext = React.createContext([]);
const dataContext = React.createContext(null);

const Contexts = {
  userContext: userContext,
  dataContext: dataContext
}

export default Contexts;
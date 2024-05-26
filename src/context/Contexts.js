    import React from 'react'

    const UserContext  = React.createContext([]);
    const DataContext  = React.createContext(null);

    const Contexts = {
      UserContext: UserContext,
      DataContext: DataContext
    }

    export default Contexts;
const getApiErrorMessage = (
  error
) => {

  try {

    const parsed =
      JSON.parse(
        error?.message
      );

    return (
      parsed?.message ||
      error?.message
    );

  } catch {

    return (
      error?.message ||
      "Error inesperado"
    );

  }

};

export default getApiErrorMessage;
export const trimEmail = (email: string) => {
  if (email) {
    return email.toLowerCase().trim();
  }

  return undefined;
};

export const getFullText = (
  text: string,
  textData: { [key: string]: string },
) => {
  let newText = text;

  if (textData && text) {
    for (const value in textData) {
      newText = newText.replace(`{{${value}}}`, textData[value]);
    }
  }

  return newText;
};

export const getFiatAmount = (x: number) => Math.trunc(x * 100) / 100;

export const validateEmail = (email: string) => {
  const re =
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
  return re.test(String(email).toLowerCase());
};

export const formatStrForPath = (str: string) => str.toLocaleLowerCase().replace(' ', '');

export const isCorrectPath = (str: string) => {
    const test = RegExp(/^[a-z_0-9]{1,}$/);
    return test.test(str);
};

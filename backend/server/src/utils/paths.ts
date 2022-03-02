export const formatTitleToPath = (str: string) => str.toLocaleLowerCase().replace(' ', '_');

export const isCorrectPath = (str: string) => {
    const test = RegExp(/^[a-z_0-9]{1,}$/);
    return test.test(str);
};

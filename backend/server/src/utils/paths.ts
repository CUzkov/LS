export const formatTitleToPath = (str: string) => str.toLocaleLowerCase().replace(/ /g, '_');

export const isCorrectPath = (str: string) => {
    const test = RegExp(/^[a-z_0-9]{1,}$/);
    return test.test(str);
};

export const isCorrectGroupName = (str: string) => {
    const test = RegExp(/^[a-z0-9а-яA-ZА-Я_ ]{1,}$/);
    return test.test(str);
};

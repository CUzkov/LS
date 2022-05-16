export const formatTitleToPath = (str: string) => str.toLocaleLowerCase().replace(/ /g, '_');

export const deleteExtraSpaces = (value: string) => value.replace(/\s+/g, ' ').trim();

export const isCorrectName = (str: string) => {
    const re = /^[a-z0-9а-яA-ZА-Я_ ]{1,}$/;
    return re.test(str);
};

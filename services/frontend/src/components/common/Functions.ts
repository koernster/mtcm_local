export interface GroupOption {
    value: string;
    label: string;
}

export const transformGroupOptions = (data: any[]): GroupOption[] => {
    if (data && data.length > 0) {
        return data.map((x) => {
            return {
                label: x.name,
                value: x.id
            } as GroupOption;
        })
    } else {
        return [];
    }
}
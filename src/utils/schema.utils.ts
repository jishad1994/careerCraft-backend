export function isAddressRequired(this: any) {
    return this.address && Object.keys(this.address).length > 0;
}

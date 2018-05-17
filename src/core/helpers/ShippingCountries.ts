import { getDataSet, reduce } from 'iso3166-2-db';
import { NotFoundException } from '../../api/exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class ShippingCountries {
    public static countryCodeList;
    public static countryList;

    public static initialize(): void {
        this.countryCodeList = reduce(getDataSet(), 'en');
        this.countryList = {}; // TODO: named as List even though it is not a list but an object,

        for ( const x in this.countryCodeList ) {
            if ( x ) {
                this.countryList[this.countryCodeList[x].name.toUpperCase()] = x.toUpperCase();
            }
        }
    }

    /**
     * TODO: desc
     *
     * @param countryCode
     * @returns {boolean}
     */
    public static getCountry( countryCode: string ): string {
        countryCode = countryCode.toString().toUpperCase();
        if ( this.countryCodeList[countryCode] ) {
            return this.countryCodeList[countryCode].iso;
        }
        throw new NotFoundException(`Could not find country code <${countryCode}>`);
    }

    /**
     * TODO: desc
     *
     * @param country
     * @returns {any}
     */
    public static getCountryCode( country: string ): string {
        country = country.toString().toUpperCase();
        if ( this.countryList[country] ) {
            return this.countryList[country];
        }
        throw new NotFoundException(`Could not find country <${country}>`);
    }

    /**
     * TODO: desc
     *
     * @param country
     * @returns {boolean}
     */
    public static isValidCountry( country: string ): boolean {
        country = country.toString().toUpperCase();
        if ( this.countryList[country] ) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * TODO: desc
     *
     * @param countryCode
     * @returns {boolean}
     */
    public static isValidCountryCode( countryCode: string ): boolean {
        countryCode = countryCode.toString().toUpperCase();
        if ( this.countryCodeList[countryCode] ) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Convert country to country code, if valid country.
     * If country code and invalid, throw exception and print to log.
     * TODO: remove log
     *
     * @param log
     * @param countryCode
     * @returns {string}
     */
    public static validate( log: LoggerType, countryCode: string ): string {
        countryCode = countryCode.toString().toUpperCase();
        if ( ShippingCountries.isValidCountry(countryCode) ) {
            countryCode = ShippingCountries.getCountryCode(countryCode);
        } else if (ShippingCountries.isValidCountryCode(countryCode) === false)  { //  Check if valid country code
            log.warn(`Country code <${countryCode}> was not valid!`);
            throw new NotFoundException(`Country code <${countryCode}> was not valid!`);
        }
        return countryCode;
    }
}
ShippingCountries.initialize();

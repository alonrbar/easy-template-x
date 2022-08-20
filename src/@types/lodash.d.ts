// https://lodash.com/docs/4.17.15#get
module "lodash.get" {

    /**
     * Gets the value at path of object. If the resolved value is undefined, the
     * defaultValue is returned in its place.
     */
    function get(object: any, path: string | string[]): any;
    function get(object: any, path: string | string[], defaultValue: any): any;

    export default get;
}

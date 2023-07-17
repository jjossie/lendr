import {AdditionalWidgetProperties, useConnector} from 'react-instantsearch-hooks-web';
import connectGeoSearch, {
  GeoSearchConnectorParams,
  GeoSearchWidgetDescription,
} from 'instantsearch.js/es/connectors/geo-search/connectGeoSearch';


import {Text} from "native-base";
import {useLocation} from "../../../utils/hooks/useLocation";

export type UseGeoSearchProps = GeoSearchConnectorParams;

export function useGeoSearch(
    props: UseGeoSearchProps,
    additionalWidgetProperties: AdditionalWidgetProperties,
) {
  return useConnector<GeoSearchConnectorParams, GeoSearchWidgetDescription>(
      connectGeoSearch,
      props,
      additionalWidgetProperties,
  );
}

export function GeoSearch(props: UseGeoSearchProps) {
  const {items, refine, sendEvent, position} = useGeoSearch(props, {
    $$widgetType: 'my-organization.geoSearch',
  });

  const {geopoint} = useLocation();

  console.log("❇️GeoSearch Position: ", JSON.stringify(position));

  return <>
    <Text>{JSON.stringify(position)}</Text>

    {
      // items.map((item) => (
      //     <Text key={item.objectID}>{item.objectID}</Text>
      // ))
    }
  </>;
}
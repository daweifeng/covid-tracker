import { useState, useEffect } from 'react';

const API_URL = 'https://covid-server.dawei.io/cases'

export enum RequestStatus {
  OK,
  FAILED,
  FETCHING,
}

export const useGeoLocation = () => {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported!');
  }
  const [geolocation, setGeolocation] = useState({
    lat: 0,
    long: 0
  });
  const [geoError, setGeoError] = useState<GeolocationPositionError | null>(null);
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => { 
      setGeolocation({ lat: position.coords.latitude, long: position.coords.longitude });
    }, (error) => setGeoError(error));
  }, []);
  return { geolocation, geoError };
}

export const useCovidData = (lat: number, long: number, ts: number) => {
  const [covidData, setCovidData] = useState({
    county: '',
    state: '',
    latestDay: '',
    newCases: 0,
    historyCases: [] as any
  });
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<RequestStatus>(RequestStatus.FETCHING)

  useEffect(() => {
    fetch(`${API_URL}/confirmedSevenDay?lat=${lat}&long=${long}&ts=${ts}`)
      .then(response => response.json())
      .then(data => {
        console.log(data)
        if(data.length === 0) {
          setStatus(RequestStatus.FAILED);
          throw new Error('No data');
        }
        const closestLocationData = data[0];
        const yesterday = new Date(ts);
        const yesterdayStr = `${yesterday.getUTCMonth() + 1}/${yesterday.getUTCDate()}/${yesterday.getUTCFullYear() - 2000}`
        const historyCases = [];
        let latestDay = '';
        let newCases = 0;
        let shouldCalNewCases = false

        for (let day = 0; day<7; day++) {
          const theDay = new Date(yesterday);
          theDay.setDate(yesterday.getDate() - day);
          const theDayStr = `${theDay.getUTCMonth() + 1}/${theDay.getUTCDate()}/${theDay.getUTCFullYear() - 2000}`;
          if (!closestLocationData[theDayStr]) {
            continue;
          }
          if (shouldCalNewCases) {
            newCases =parseInt(closestLocationData[latestDay]) -  parseInt(closestLocationData[theDayStr]);
            shouldCalNewCases = false;
          }
          if (latestDay === '') {
            latestDay = theDayStr;
            shouldCalNewCases = true;
          }
          historyCases.push({ [theDayStr]: parseInt(closestLocationData[theDayStr]) });
        }
        setCovidData({
          county: closestLocationData.Admin2,
          state: closestLocationData.Province_State,
          latestDay: latestDay,
          newCases,
          historyCases
        })
        setStatus(RequestStatus.OK);
      })
      .catch(error => {
        setStatus(RequestStatus.FAILED);
        setError(error);
      })
  }, [lat, long])

  return { covidData, error, status }
}
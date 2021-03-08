import React from 'react';
import { ComposedChart, Bar, XAxis, Line, Tooltip, LabelList } from 'recharts';
import './App.css';
import { useGeoLocation, useCovidData, RequestStatus } from './hooks';

function App() {
  const {geolocation, geoError} = useGeoLocation();
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const { covidData, error, status } = useCovidData(geolocation.lat, geolocation.long, yesterday.getTime())

  if (geoError) {
    return (
      <div>
        Please allow geolocation
      </div>
    )
  }
  if (status === RequestStatus.FAILED) {
    console.error(error)
    return <div>Failed to get data</div>
  }
  if (status === RequestStatus.FETCHING) {
    return <div>Loading</div>
  }
  console.log(covidData.historyCases)
  return (
    <div className="App">
      <h1>{covidData.county}, {covidData.state}</h1>
      <div className='latest-day'>as of {covidData.latestDay}</div>
      <div className="new-cases-card">
        <div className="card-title">New Cases</div>
        <div className="card-arrow"><i className="fas fa-arrow-up "></i></div>
        <div className="number">{covidData.newCases}</div>
      </div>
      <div className="graph-card">
        <div className="title">
          Past Five Days
          <hr />
        </div>
        <div className="graph">
          <ComposedChart
            margin={{
              top: 12,
              left: 12,
              right: 12
            }}
            width={350}
            height={200}
            data={covidData.historyCases}
          >
            <XAxis dataKey="date" />
            <Bar dataKey="newCases" fill="#F05C5C">
              <LabelList dataKey="newCases" position="top" fill="#F05C5C" />
            </Bar>
            <Line type="monotone" dataKey="newCases" stroke="#ffffff" />
          </ComposedChart>
        </div>
      </div>
    </div>
  );
}

export default App;

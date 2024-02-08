import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import Axios from 'axios';
import AddEditForm from './AddEditForm';
import DataList from './DataList';
import Pagination from '../Layout/Pagination';
import LoadingScreen from '../Layout/LoadingScreen';
import AskForPrint from './AskForPrints';
import SearchingBox from './SearchingBox';

const BillScreen = (props) => {
  const [state, setState] = useState({
    clientList: [],
    data: [],
    pagedData: [],
    modalState: { addBill: false, askToPrint: false },
    idToPrint: '',
    isLoading: true,
  });

  useEffect(() => {
    getData();
  }, []);

  const addBill = () => {
    setState((prevState) => ({
      ...prevState,
      modalState: {
        ...prevState.modalState,
        addBill: !prevState.modalState.addBill,
      },
    }));
  };

  const getData = () => {
    const HEADERSCONFIG = {
      headers: { 'auth-token': localStorage.getItem('token') },
    };
    const GETBILLS = Axios.get(
      `${process.env.REACT_APP_BACKEND_URL}/api/bills/get`,
      HEADERSCONFIG
    );
    const GETCLIENTS = Axios.get(
      `${process.env.REACT_APP_BACKEND_URL}/api/clients/get`,
      HEADERSCONFIG
    );

    Axios.all([GETBILLS, GETCLIENTS]).then(
      Axios.spread((...responses) => {
        setState((prevState) => ({
          ...prevState,
          data: responses[0].data.data,
          clientList: responses[1].data,
          isLoading: false,
        }));
      })
    );
  };

  const onChangePage = (pagedData) => {
    setState((prevState) => ({ ...prevState, pagedData }));
  };

  const askToPrint = (id) => {
    setState((prevState) => ({
      ...prevState,
      modalState: {
        ...prevState.modalState,
        askToPrint: !prevState.modalState.askToPrint,
      },
      idToPrint: id ? id : '',
    }));
  };

  if (state.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <AddEditForm
        show={state.modalState.addBill}
        onHide={addBill}
        refresh={getData}
        clientList={state.clientList}
        askToPrint={(i) => askToPrint(i)}
      />
      <AskForPrint
        {...props}
        show={state.modalState.askToPrint}
        onHide={() => askToPrint('')}
        id={state.idToPrint}
      />

      <Row>
        <Col>
          <Row>
            <Col>
              <SearchingBox
                refresh={getData}
                setResults={(i) =>
                  setState((prevState) => ({ ...prevState, data: i }))
                }
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <DataList
                data={state.pagedData}
                clientList={state.clientList}
                addBill={addBill}
                refresh={getData}
                {...props}
              />
            </Col>
          </Row>
          <Row>
            <Col className='p-3 my-3 bg-light rounded shadow d-flex justify-content-center'>
              <Pagination
                items={state.data}
                onChangePage={onChangePage}
                pageSize={5}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default BillScreen;

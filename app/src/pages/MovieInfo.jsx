import { API_URL } from "../App";
import { useState, useEffect, useRef } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { AgGridReact } from "ag-grid-react";
import { themeAlpine, colorSchemeDarkWarm, ModuleRegistry, InfiniteRowModelModule } from 'ag-grid-community';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/Auth";

ModuleRegistry.registerModules([InfiniteRowModelModule]);

function MovieInfo({ id, back }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const userRef = useRef(user);

    const [movieData, setMovieData] = useState('');
    const [modalOpen, setModalOpen] = useState(false);

    const gridRef = useRef();
    const pageSize = 100;
    const maxBlocks = 10;

    const retrieve = async() => {
        try {

            const response = await fetch(`${API_URL}/movies/data/${id}`)
            const data = await response.json();

            if (response.ok) {
                setMovieData(data);
            } else {
                navigate('/not-found');
            }

        } catch (err) {
            navigate('/not-found');
            console.error('error retrieving movie data!', err);
        }
    }

    useEffect(() => {
        userRef.current = user;
    }, [user]);

    const handleClick = (data) => {
        if (userRef.current) navigate(`/people/${data.id}`);
        else setModalOpen(true);
    }

    const [colDefs, setColDefs] = useState([
        { field: 'name',
            cellRenderer: (data) => (
                <span
                    style={{ color:'white', 
                                cursor: 'pointer',
                                textDecoration: 'underline' }}
                    onClick={() => handleClick(data.data)}> 
                    {data.value}
                </span>
            ),
        },
        { field: 'category', width: '150px', headerName: 'Role',
            cellStyle: { textTransform: 'capitalize' }
        },
        { field: 'characters'},
    ]);

    const defaultColDefs = {
        resizable: false,
        cellStyle: {textAlign: 'left'},
        sortable: false,
    };

    useEffect(() => {
        if (gridRef.current && movieData.principals) {
            const datasource = {
                getRows: (params) => {
                    params.successCallback(movieData.principals, movieData.principals.length);
                }
            };
            gridRef.current.api.setGridOption('datasource', datasource);
        }
    }, [movieData.principals]);

    useEffect(() => {
        retrieve();
    }, [id]);

    return (
        <div>
            <Modal isOpen={modalOpen} onClick={() => setModalOpen(false)}>
                <ModalHeader>Error</ModalHeader>
                <ModalBody>
                    Please login to access this page.
                </ModalBody>
                <ModalFooter>
                    <Button>
                        Close
                    </Button>
                </ModalFooter>
            </Modal>
            <div style={{ display: 'flex', textAlign: 'left'}}>
                <div>
                    <Button onClick={back} style={{ marginRight: '20px', width: '100px'}}>
                        ← Back
                    </Button>
                </div>
                <div>
                    <h2>{movieData.title}</h2>
                    Released in: {movieData.year}<br/>
                    Runtime: {movieData.runtime} minutes<br/>
                    Country: {movieData.country}<br/>
                    Box Office: {movieData.boxoffice ? `$${movieData.boxoffice.toLocaleString()}` : 'unknown'}<br/>
                    Genres: {movieData.genres && movieData.genres.length > 0 ? (
                                movieData.genres.map((genre, i) => (
                                    <li key={i}>{genre}</li>))) : (
                                    <li>No genres available</li>
                            )}<br/>
                    <i>{movieData.plot}</i>
                    <br/>
                    <br/>
                    <div style={{ textAlign: 'right' }}>
                        <div>
                            {movieData.ratings && movieData.ratings.length > 0 ? (
                                movieData.ratings.map((rating, i) => (
                                    rating.value ? (
                                    <h6 key={i}>
                                        {rating.source}: {rating.value}
                                    </h6>
                                    ) : null
                                ))) : (
                                <div>No ratings available</div>
                            )}
                        </div>
                    </div>
                </div>
                <div>
                    <img src={movieData.poster} alt='poster' style={{ marginLeft: '20px', marginRight: '20px' }}/>
                </div>
                <div style={{ minHeight: '300px', minWidth: '405px' }}>
                    <AgGridReact
                        ref={gridRef}
                        theme={themeAlpine.withPart(colorSchemeDarkWarm)}
                        rowModelType='infinite'
                        cacheBlockSize={pageSize}
                        maxBlocksInCache={maxBlocks}
                        columnDefs={colDefs}
                        defaultColDef={defaultColDefs}
                    />
                </div>
            </div>
        </div>
    );
}

export default MovieInfo;
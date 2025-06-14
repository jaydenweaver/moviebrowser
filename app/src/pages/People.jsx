import { useEffect, useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AgGridReact } from 'ag-grid-react';
import { themeAlpine, colorSchemeDarkWarm, ModuleRegistry, InfiniteRowModelModule } from 'ag-grid-community';
import { API_URL } from '../App';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/Auth';
import MyChart from '../components/Chart';

ModuleRegistry.registerModules([InfiniteRowModelModule]);
function People() {
    const { user, authFetch } = useAuth();
    const navigate = useNavigate();

    const location = useLocation();
    const [personData, setPersonData] = useState('');

    const gridRef = useRef();
    const pageSize = 100;
    const maxBlocks = 10;

    const retrieve = async() => {
        try {
            const response = await authFetch(
                                    `${API_URL}${location.pathname}`);
            
            if (!response.ok) throw new Error('fetch failed');
    
            const data = await response.json();
            setPersonData(data);
        } catch (err) {
            console.error('Failed to retrieve person data:', err);
        }
    }

    const handleClick = (data) => {
        navigate(`/movies/${data.movieId}`);
    }

    const [colDefs, setColDefs] = useState([
        { field: 'movieName', headerName: 'Movie', width: 250,
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
        { field: 'imdbRating', width: '75px', headerName: 'Rating'},
    ]);

    const defaultColDefs = {
        resizable: false,
        cellStyle: {textAlign: 'left'},
        sortable: false,
    };

    useEffect(() => {
        if (gridRef.current && personData.roles) {
            const datasource = {
                getRows: (params) => {
                    params.successCallback(personData.roles, personData.roles.length);
                }
            };
            gridRef.current.api.setGridOption('datasource', datasource);
        }
    }, [personData.roles]);

    useEffect(() => {
        if (user != null) retrieve();
        else navigate('/not-found');
    }, [location.pathname, user]);

    return (
        <div>
            <h2>{personData.name}</h2>
            <div style={{ textAlign: 'center' }}>
                {personData.birthYear ? (
                `${personData.birthYear} - ${personData.deathYear || ''}`
                ) : ''}
            </div>
            <div style={{ display: 'flex' }}>
                <div style={{ height: '400px', width: '700px', marginRight: '10px' }}>
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
                <div style={{ height: '400px', width: '500px' }}>
                    <MyChart data={personData.roles}/>
                </div>
            </div>
        </div>
        
    );
};

export default People;
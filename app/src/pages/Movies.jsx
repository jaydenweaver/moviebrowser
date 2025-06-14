import { useEffect, useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AgGridReact } from 'ag-grid-react';
import { themeAlpine, colorSchemeDarkWarm, ModuleRegistry, InfiniteRowModelModule } from 'ag-grid-community';
import { API_URL } from '../App';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, InputGroup, Input, Button } from 'reactstrap';
import MovieInfo from './MovieInfo.jsx';
import { useNavigate, useParams } from 'react-router-dom';

ModuleRegistry.registerModules([InfiniteRowModelModule]);

function Movies() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [focus, setFocus] = useState('');

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    const gridRef = useRef();
    const pageSize = 100;
    const maxBlocks = 10;
    
    useEffect(() => {
        if (id) {
            setFocus(id);
        } else {
            setFocus('');
        }
    }, [id]);

    const handleClick = (data) => {
        navigate(`/movies/${data.imdbID}`);
    }

    const back = () => navigate(`/movies`);

    const [colDefs, setColDefs] = useState([
        { field: 'title', width:300, maxWidth: 300,
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
        { field: 'year'},
        { field: 'imdbRating', headerName: 'IMDb'},
        { field: 'rottenTomatoesRating', headerName: 'Rotten Tomatoes'},
        { field: 'metacriticRating', headerName: 'Metacritic'},
        { field: 'classification'},
    ]);

    const defaultColDefs = {
        resizable: false,
        maxWidth: 150,
        cellStyle: {textAlign: 'left'},
        sortable: false,
    };
    
    const [title, setTitle] = useState('');
    const [year, setYear] = useState('Any Year');

    const datasource = {
        getRows: async (params) => {
            const page = Math.floor(params.startRow / pageSize) + 1;
            const urlParams = new URLSearchParams();

            if (title) urlParams.append('title', title);
            if (year != 'Any Year') urlParams.append('year', year);
            if (page) urlParams.append('page', page);
        
            const url = `${API_URL}/movies/search?${urlParams.toString()}`;
            try {
                const response = await fetch(url);
                const data = await response.json();

                params.successCallback(data.data, data.pagination.total);
            } catch (err) {
                params.failCallback();
            }
        },
    };

    const onGridReady = (params) => {
        params.api.setGridOption('datasource', datasource);
    }

    const handleSearch = () => {
        if (gridRef.current && gridRef.current.api) {
            gridRef.current.api.setGridOption('datasource', datasource);
            gridRef.current.api.purgeInfiniteCache();
        }
    }

    const firstYear = 1990;
    const years = Array.from({length: (new Date().getFullYear()) - firstYear + 1},
                                (_, i) => (new Date().getFullYear()) - i);
    
    if (focus == '') {
        return (
            <div>
                <div style={{ height: '400px', width: '1100px' }}>
                    <AgGridReact 
                        ref={gridRef}
                        theme={themeAlpine.withPart(colorSchemeDarkWarm)}
                        rowModelType='infinite'
                        cacheBlockSize={pageSize}
                        maxBlocksInCache={maxBlocks}
                        onGridReady={onGridReady}
                        columnDefs={colDefs}
                        defaultColDef={defaultColDefs}
                    />
                </div>
                <div>
                    <InputGroup>
                        <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown} >
                            <DropdownToggle style={{ paddingRight: '5px', width: '100px'}} outline split>
                                <span style={{ marginRight: '8px' }}>{year}</span>
                            </DropdownToggle>
                            <DropdownMenu style={{ minWidth: '150px', maxHeight: '200px', overflowY: 'auto' }}>
                                <DropdownItem onClick={() => setYear('Any Year')}>Any Year</DropdownItem>
                                {years.map(year => (
                                    <DropdownItem key={year} onClick={() => setYear(year)}>{year}</DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>
                        <Input
                            value={title} 
                            placeholder='enter a movie title'
                            onChange={(e) => {setTitle(e.target.value);}}/>
                        <Button style={{ backgroundColor: '#d1772e'}}
                                onClick={handleSearch}>
                            Search
                        </Button>
                    </InputGroup>
                </div>
            </div>
        );
    } else {
        return (
            <MovieInfo id={focus} back={back}/>
        );
    }
    
};

export default Movies;
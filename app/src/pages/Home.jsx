import 'bootstrap/dist/css/bootstrap.min.css';
import CameraImage from '../assets/film_camera.jpg';

function Home() {
    return (
        <div className="image-container">
            <img src={CameraImage} style={{ width: '800px'}}/>
        </div>
    );
};

export default Home;
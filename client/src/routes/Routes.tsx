import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home/Home';
import Library from '../pages/Library/Library';
import Backlog from '../pages/Backlog/Backlog';
import Collections from '../pages/Collections/Collections';
import Collection from '../pages/Collection/Collection';


const AppRoutes = () => {
    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/library/:sortingMethod' element={<Library />} />
            <Route path='/library' element={<Library />} />
            <Route path='/backlog' element={<Backlog />} />
            <Route path='/collections' element={<Collections />} />
            <Route path='/collection/:id' element={<Collection />} />
        </Routes>
    )
}

export default AppRoutes;
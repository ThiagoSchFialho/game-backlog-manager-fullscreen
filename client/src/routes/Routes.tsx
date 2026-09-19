import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home/Home';
import Library from '../pages/Library/Library';
import Completed from '../pages/Completed/Completed';
import Backlog from '../pages/Backlog/Backlog';
import Collections from '../pages/Collections/Collections';
import Collection from '../pages/Collection/Collection';
import Hidden from '../pages/Hidden/Hidden';


const AppRoutes = () => {
    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/library/:sortingMethod' element={<Library />} />
            <Route path='/library' element={<Library />} />
            <Route path='/completed' element={<Completed />} />
            <Route path='/backlog' element={<Backlog />} />
            <Route path='/collections' element={<Collections />} />
            <Route path='/collection/:id' element={<Collection />} />
            <Route path='/hidden' element={<Hidden />} />
        </Routes>
    )
}

export default AppRoutes;
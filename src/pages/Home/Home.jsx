import { usePageMeta } from '../../hooks/usePageMeta';
import './Home.css';


function Home(){
    usePageMeta({
        title: '윤태준',
        description:
            'Edge AI와 컴퓨터 비전을 연구하는 윤태준의 포트폴리오입니다. 논문, 프로젝트, 수상 경력을 확인해 보세요.',
        path: '/',
    });

    return(
        <div className='home-container'>
            <div className='home-title'>
                <span className='typing-text'>
                    Exploring different areas of software development
                </span>
            </div>
            <div className='home-interest fade-in-up'>
                Edge AI · CV · MLOps
            </div>
        </div>
    )
}

export default Home;
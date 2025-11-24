import './Home.css';


function Home(){
    return(
        <div className='home-container'>
            <div className='home-title'>
                <span className='typing-text'>
                    Exploring different areas of software development
                </span>
            </div>
            <div className='home-interest fade-in-up'>
                Edge AI · CV · NLP · MLOps
            </div>
        </div>
    )
}

export default Home;
/**
 * Created by 872458899@qq.com on 2017/1/7.
 */
import React from 'react';
import ReactDOM from 'react-dom';

function Page() {
    const topice = ['React','Flux','Redux','angular'];

    return (
        <div>
            <h1>React Book Title</h1>
            <ul>
                {topice.map((topic,index) => (<li key={index}>{topic}</li>))}
            </ul>
        </div>
    )
}

ReactDOM.render(<Page/>,document.getElementById('app'));
import Styles from  './CardProject.module.css'
import Image from 'next/image'


export default function CardProject(){
    return (
    <div className={Styles.card}>
        <div className={Styles.cardHeader}>Meu teste  
            <button className={Styles.btnEdit}>
                <Image src='/icons/edit.png' height='20' width='20'/>
            </button>
        </div>
        <button className={Styles.btnAbrir}>Abrir</button>
        <div className={Styles.legendTime}>Atualizado à 7 minutos</div>
    </div>
    );
}
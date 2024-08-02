import Image from 'next/image';
import Styles from '@/styles/modules/playground/playgroundArea.module.css'

import PlaygroundContext from '@/components/contexts/PlaygroundContext';
import { useContext, useState } from 'react';
import ArobotPlayer from '@/components/ui/ArobotPlayer';

const arduino_codebase =
`#include <Servo.h>

Servo servoDireito;
Servo servoEsquerdo;

void setup() {
  // seu código aqui executa uma vez:
  Serial.begin(9600);
  servoDireito.attach(6);
  servoEsquerdo.attach(5);
  
//{restante_code}
}

void loop() {
  //  seu código aqui executa repetidamente:

}
`

export default function PlaygroundArea() {
    const { niveis, runState, changeRunState, addNivel,  currentNivel} = useContext(PlaygroundContext);
    const [showExportImportMenu, setShowExportImportMenu] = useState(false);
    const disable_buttons = {
        pause: false,
        play: false,
    };

    switch (runState) {
        case 'run':
            disable_buttons.play = true;
            disable_buttons.pause = false;
            break;
        case 'pause':
            disable_buttons.play = false;
            disable_buttons.pause = true;

    }

    const exportProject = () => {

        var nome_file = prompt('Qual será o nome do ficheiro: ');
        if (nome_file == '') nome_file = 'projecto_arobot_playground';

        const link = document.createElement('a');
        link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(
            JSON.stringify(niveis)
        ));
        link.setAttribute('download', nome_file + '.playground');

        link.click();

    }
    const exportToArduino = ()=>{
        var nome_file = prompt('Qual será o nome do ficheiro: ');
        if (nome_file == '') nome_file = 'projecto_arobot_playground';

        var arduino_code = arduino_codebase;
        const blocks = niveis[currentNivel].blocks;
        var code_blocks = '';
        //'  '

        for (const block of blocks) {
            switch (block.name) {
                case 'mover':
                    var passos = parseInt(block.sequence[1].value);
                    var number_voltas = Math.floor(passos / 10);
                    var restante_passo = passos - (number_voltas*10);
                   
                    if (number_voltas > 0){
                    code_blocks+=
                    `  for (int x= 0; x < ${number_voltas}; x++){
                         servoDireito.write(360);
                         servoEsquerdo.write(360);
                         delay(15);
                       }\n`;
                    }
                    if (restante_passo > 0){
                        code_blocks+=`  servoDireito.write(${restante_passo});\n`;
                        code_blocks+=`  servoEsquerdo.write(${restante_passo});\n`;
                    }
                    code_blocks+=`  delay(100);\n`;
                    //Serial.write();

                    break;
                case 'rotate':
                    var graus = parseInt(block.sequence[1].value);
                   // code_blocks+=`  angleCurrent+=${graus};`;
                    if (graus > 0){
                        code_blocks+=
                        `  for (int x= 0; x < ${graus}; x++){
                             servoDireito.write(360);
                             servoEsquerdo.write(-360);
                             delay(15);
                           }\n`;
                    }
                    else if(graus < 0){
                        code_blocks+=
                        `  for (int x= 0; x < ${Math.abs(graus)}; x++){
                             servoDireito.write(-360);
                             servoEsquerdo.write(360);
                             delay(15);
                           }\n`;
                    }

                    break;
                case 'rotate-exact':
                    //precisa ser melhorado
                    var graus = parseInt(block.sequence[1].value);
                   // code_blocks+=`  angleCurrent+=${graus};`;
                    if (graus > 0){
                        code_blocks+=
                        `  for (int x= 0; x < ${graus}; x++){
                             servoDireito.write(360);
                             servoEsquerdo.write(-360);
                             delay(15);
                           }\n`;
                    }
                    else if(graus < 0){
                        code_blocks+=
                        `  for (int x= 0; x < ${Math.abs(graus)}; x++){
                             servoDireito.write(-360);
                             servoEsquerdo.write(360);
                             delay(15);
                           }\n`;
                    }
                    break;
                case 'buzinar':
                    code_blocks+=`  Serial.write('Buzinou');\n`;
                    code_blocks+=`  delay(100);\n`;
                    break;
                case 'esperar':
                    var delay=parseInt(block.sequence[1].value) * 1000;
                    code_blocks+=`  delay(${delay});\n`;

                    break;
                case 'acender_luz':
                    code_blocks+=`  Serial.write('Luz acessa');\n`;
                    code_blocks+=`  delay(100);\n`;
                    break;
                case 'apagar_luz':
                    code_blocks+=`  Serial.write('Luz apagada');\n`;
                    code_blocks+=`  delay(100);\n`;
                    break;
                case 'avancar_nivel':
                    break;
                case 'recuar_nivel':
                    break;
                case 'nivel_especifico':
                    break;

                case 'console_message':
                    var valor = block.getValue();
                    code_blocks+=`  Serial.write('${valor}');\n`;
        
                    break;
            }
        }
        
        arduino_code = arduino_code.replace('//{restante_code}', code_blocks);
        const link = document.createElement('a');
        link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(
            arduino_code
        ));
        link.setAttribute('download', nome_file + '.ino');

        link.click();
    }


    const importProject = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.playground';
        input.click();

        input.addEventListener('change', () => {
            if (input.files.length == 1) {
                const file = input.files[0];
                file.text().then((value) => {
                    try {

                        //pega o dados importado e tenta converter em json, 
                        //gera um erro caso está incompativel
                        const data = JSON.parse(value);

                        //é compativel
                        if (isFileDataCompatible(data)) {
                            addNivel([...data]);
                        }

                        else {
                            throw 'O ficheiro não é compatível com o Playground';
                        }
                    }
                    catch (e) {
                        alert('Houve um problema no arquivo que importaste!');
                    }
                });
            }
            else {
                alert('Selecione um ficheiro apenas.');
            }
        });

    }

    return (
        <div className={Styles.playgroundArea + ' ' + Styles.areaActive} >

            <div className={Styles.panelRunFunctions}>

                <button className={Styles.btnRunFunction} disabled={disable_buttons.play}
                    onClick={() => { changeRunState('play') }}>
                    <Image src='/icons/play.png' width='20' height='20' alt='' />
                </button>

                <button className={Styles.btnRunFunction} disabled={disable_buttons.pause}
                    onClick={() => { changeRunState('pause') }}>
                    <Image src='/icons/pause.png' width='20' height='20' alt='' />
                </button>
            </div>

            <button className={Styles.exportImportProject + ' ' +
                (showExportImportMenu ? Styles.exportImportProjectActive : '')}
                onClick={() => {
                    setShowExportImportMenu(!showExportImportMenu);
                }} onBlur={() => {
                    setShowExportImportMenu(false);
                }} >
                <Image src='/icons/settings.png' width='22' height='22' />

                {(showExportImportMenu &&
                    <div className={Styles.exportImportMenu} onClick={(ev) => {
                        ev.stopPropagation();
                    }}>
                        <div onClick={exportToArduino} className={Styles.exportProject}>Exportar para Arduino</div>
                        <div onClick={exportProject} className={Styles.exportProject}>Salvar projecto</div>
                        <div onClick={importProject} className={Styles.importProject}>Importar projecto</div>
                    </div>)}

            </button>


            <div className={Styles.boardPlayground} >
                <ArobotPlayer />
            </div>
        </div>

    )
}

function isFileDataCompatible(data){
     //verificando se o formato é realmente compátivel
     let isCompativel = false;

     //verifica se é lista
     if (typeof data.length !== undefined) {

         //n representa cada nivel
         for (const n of data) {

             //verifica se o nivel contem a proprieda bloco
             if (typeof n.blocks !== undefined) {

                 //verifica se é lista
                 if (typeof n.blocks.length !== undefined) {

                     //caso tenha 0 blocks
                     if (n.blocks.length == 0) {
                         isCompativel = true;
                         continue;
                     }

                     //pega cada bloco e verifica se contem todas 
                     //propriedades
                     for (const b of n.blocks) {
                         if (typeof b.sequence !== undefined
                             && typeof b.id !== undefined
                             && typeof b.title !== undefined
                             && typeof b.name !== undefined) {
                             isCompativel = true;
                         }
                         else {
                             isCompativel = false;
                             break;
                         }
                     }
                 }

                 else {
                     isCompativel = false;
                 }


                 if (isCompativel == false) {
                     break;
                 }
             }

             else {
                 isCompativel = false;
                 break;
             }
         }


     }

     else {
         isCompativel = false;
     }

     return isCompativel;
}
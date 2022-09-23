zeroes = [
  '543544072303548185257517071258879077999438229338741863745347926248040160894',
  '5263148031615500517773789998166832002359358478815380373385457941076984476107',
  '17956485954079679132773811758681578949163794793418771629775186921851074473020',
  '12818849578198618706853641503807770441784379819766699750158640467167373686827',
  '20855805136626712543492304455032428762867320990141515473916248306878494117308',
  '16078145596845420873218387454438458413474087448530358305197693667765135117',
  '21469358837161435717475425023508741936366411081678940161225564928734007400175',
  '97392844013092531948986239638340052193563694412037219481774368684748869683',
  '9815574307005671302652737758332422327334048281128864225462159121130705840521',
  '7087204700527144239556873464136052126786766979088398104134271794395334453517',
  '10181090640042689059947552705763203436486859531084608903098065737516252860965',
  '18768849884748869821279983937428267667824021795115145745181803419204387232793',
  '2933336925830545942990247205542297128021746154492853303202253775340852058090',
  '19969264030889959278249843814460631197595484808175492092586113505583667929727',
  '20630468938722375422373209141732067356319655406689772991063986092557143438884',
  '16112017084498001096426326752234891940073685446685262588324357827862522787584',
  '5014107601768362368954905654771638641173580301154118547630986651087486382582',
  '19913447121430317358013346685585730169311308417727954536999999362867231935974',
  '5383269053000864513406337829703884940333204026496599059703565359684796208512',
  '13643259613994876902857690028538868307758819349041069235229132599319944746418',
  '21581843949009751067133004474045855475316029363599471302179162475240986081250'
]

insert_func_template = '''
// i == $index$
if (((checkIndex >> $index$) & 1) == 0) {
    left = currentHash;
    right = $zero$;
    filledSubtrees[$index$] = currentHash;
} else {
    left = filledSubtrees[$index$];
    right = currentHash;
}
currentHash = hasher.poseidon([left, right]);
'''

text = str()
for i in range(20):
    text += insert_func_template.replace('$zero$', zeroes[i]).replace('$index$', str(i))

print(text)
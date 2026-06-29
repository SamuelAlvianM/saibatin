<?php

namespace App\Http\Controllers\Fronts\Permohonans;

use App\Http\Controllers\Controller;
use App\Models\Includes\OptionModel;
use App\Models\Fronts\Users\UsersModel;
use App\Models\Fronts\Permohonans\Kelahiran2Model;
use App\Models\Settings\OperasionalWaktuModel;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;

use Auth;
use DB;
use Exception;
use File;
use Validator;
use Zip;
use Carbon\Carbon;
use App\Quotation;
use Hash;
use GoogleReCaptchaV3;

class AktaKelahiranNikAdaController extends Controller
{   
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index(Request $request)
    {   
        $pelayananID    = '3'; /*m_setup_pelayanan*/
        $isNewPermohonan= ($request->get('key')=='false')?true:false;
        
        $date_now       = Carbon::now();
        $date_dayofweek = $date_now->dayOfWeek; /*0Minggu, 6:Sabtu*/
        $date_hour      = $date_now->hour;

        $data_OperasionalWaktu  = OperasionalWaktuModel::where([['pelayanan_id',$pelayananID],['hari_id',$date_dayofweek],['status','1']])->whereTime('jam_start', '<=', $date_now->toTimeString())->whereTime('jam_end', '>=', $date_now->toTimeString())->exists();

        if(!$data_OperasionalWaktu):
            return view('fronts.permohonans.jamkerja');
        else:
            $urlRoute   = $request->get('id');
            $key        = $request->get('key');
            $modal      = $request->get('modal');
            $prm1       = $request->get('prm1')?$request->get('prm1'):'';
            $prm2       = $request->get('prm2')?$request->get('prm2'):'';
            $prm3       = $request->get('prm3')?$request->get('prm3'):'';
            return view('fronts.permohonans.aktakelahiranNikAda', ['id'=>$urlRoute,'key'=>$key,'modal'=>$modal,'prm1'=>$prm1,'prm2'=>$prm2,'prm3'=>$prm3]);
        endif;
    }

    public function imagesindex(Request $request)
    {   
        $modal  = $request->get('modal');
        $prm2   = $request->input('prm2');
        $imagelink    = '-';
        if (file_exists(base_path().'/../../'.$prm2)):
            $imagelink = $prm2;
        endif;
        return view('fronts.permohonans.images', ['modal'=>$modal,'imagelink'=>$imagelink]);
    }

    public function postdata(Request $request)
    {
        $output_error   = array();
        $output_success = array();
        $output_data    = array();
        $output_html    = array();

        $recaptcha  = $request->get('g-recaptcha-response');
        $recaptchaRes   = GoogleReCaptchaV3::setAction('pengajuanguard_action')->verifyResponse($recaptcha,$request->getClientIp());
        
        if($recaptchaRes->isSuccess()):
        	$auth   = Auth::user();
            $sessid = $auth->id;
            $sessnik= $auth->user_nik;
            $sesskk = $auth->user_nokk;
            $sessfullname   = $auth->user_fullname;
            $sessnohp   = $auth->user_hp;
            $sesslvlID  = $auth->userlevel_id;
            $sesskodekel    = $auth->kode_kel;

            /* setup 1 [start] */
            $permohonanType = 'kelahiran_2';
            $permohonanKet  = 'Akta Kelahiran (Ada NIK)';
            $permohonanInitial  = 'AKL02';
            /* setup 1 [end] */

            $pemohonnik = $request->get('pemohonnik');
            $pemohonnama= $request->get('pemohonnama');
            $pemohonkk  = $request->get('pemohonkk');
            $pemohonhp  = $request->get('pemohonhp');
            $pemohonemail   = $request->get('pemohonemail');
            $nikbayi    = $request->get('nikbayi');
            $namalengkap= $request->get('namalengkap');
            $jeniskelamin   = $request->get('jeniskelamin');
            $tgllahir   = $request->get('tgllahir');
            $nikayah    = $request->get('nikayah');
            $namaayah   = $request->get('namaayah');
            $pekerjaan  = $request->get('pekerjaan');
            $nikibu     = $request->get('nikibu');
            $namaibu    = $request->get('namaibu');
            $anakke     = $request->get('anakke');
            $tempatdilahirkan   = $request->get('tempatdilahirkan');
            $tempatkelahiran    = $request->get('tempatkelahiran');
            $jamkelahiran   = $request->get('jamkelahiran');
            $jeniskelahiran     = $request->get('jeniskelahiran');
            $berat  = $request->get('berat');
            $panjang    = $request->get('panjang');
            $penolong   = $request->get('penolong');
            $niksaksi1  = $request->get('niksaksi1');
            $namasaksi1 = $request->get('namasaksi1');
            $niksaksi2  = $request->get('niksaksi2');
            $namasaksi2 = $request->get('namasaksi2');
            $filebukunikahx     = $request->get('filebukunikahx');
            $filekkx    = $request->get('filekkx');
            $fileketeranganlahirx   = $request->get('fileketeranganlahirx');
            $filektpsaksi1x = $request->get('filektpsaksi1x');
            $filektpsaksi2x = $request->get('filektpsaksi2x');
            $filektpayahx   = $request->get('filektpayahx');
            $filektpibux    = $request->get('filektpibux');
            $filependukung1x    = $request->get('filependukung1x');
            $filependukung2x    = $request->get('filependukung2x');
            $filependukung3x    = $request->get('filependukung3x');
            $filependukung4x    = $request->get('filependukung4x');
            $filependukung5x    = $request->get('filependukung5x');
            $catatan    = $request->get('catatan');
            $prgsts     = $request->get('prgsts');
            $rjkalasan  = $request->get('rjkalasan');
            $alasandetail   = $request->get('alasandetail');
            $key    = $request->get('key');
            $act    = $request->get('act');

            if($act=='ins'):
                $pejabataDesa_kontak   = UsersModel::selectRaw('user_id,user_hp')->where([['kode_kel',$sesskodekel],['userlevel_id','5'],['status','=','1']])->get();
                $validation = Validator::make(
                    $request->all()
                    ,[
                        'pemohonnik'    => 'required',
                        'pemohonnama'   => 'required',
                        'pemohonkk' => 'required',
                        'pemohonhp' => 'required',
                        'pemohonemail'  => 'required',

                        'nikbayi'   => 'required',
                        'namalengkap'   => 'required',
                        'jeniskelamin'  => 'required',
                        'tgllahir'  => 'required',
                        'nikayah'   => 'required',
                        'namaayah'  => 'required',
                        'pekerjaan' => 'required',
                        'nikibu'    => 'required',
                        'namaibu'   => 'required',
                        'anakke'    => 'required',
                        'tempatdilahirkan'  => 'required',
                        'tempatkelahiran'   => 'required',
                        'jamkelahiran'  => 'required',
                        'jeniskelahiran'=> 'required',
                        'berat'     => 'required',
                        'panjang'   => 'required',
                        'penolong'  => 'required',
                        'niksaksi1' => 'required',
                        'namasaksi1'=> 'required',
                        'niksaksi2' => 'required',
                        'namasaksi2'=> 'required',
                        'filebukunikahx'=> 'required',
                        'filekkx'   => 'required',
                        'fileketeranganlahirx'   => 'required',
                        'filektpsaksi1x'   => 'required',
                        'filektpsaksi2x'   => 'required'
                    ]
                    ,[
                        'required'  => ':attribute'
                    ]
                );
            elseif($act=='upd'):
                $prgsts     = $request->get('prgsts');
                $rjkalasan  = $request->get('rjkalasan');
                $alasandetail   = $request->get('alasandetail');

                $validation = Validator::make(
                    $request->all()
                    ,[
                        'key'       => 'required',
                        'prgsts'    => 'required',
                        'rjkalasan' => ($prgsts==0)?'required':'',
                        'alasandetail'  => ($prgsts==0)?'required':'',
                    ]
                    ,[
                        'required'  => ':attribute'
                    ]
                );
            endif;

            try {
    	        if($validation->fails()):
    	            foreach($validation->messages()->getMessages() as $field_name => $messages):
    	                $output_error[] = $messages;
    	            endforeach;
    	        else:
    	            if($sessnik):
    	                if($act == "ins"):
    	                	try {
    	                        $genNoPermohonanTimestamp   = Carbon::parse(now())->timestamp;
                                $lastSeqQuery   = DB::query()
                                    ->selectRaw('*')
                                    ->fromSub(
                                        function ($query) use($permohonanInitial,$genNoPermohonanTimestamp){
                                            $query
                                                ->from('t_kelahiran_2 as x1')
                                                ->selectRaw('
                                                    substr(x1.nomorPermohonan,6,3) as lastSeq
                                                ')
                                                ->whereRaw('substr(x1.nomorPermohonan,1,5)="'.$permohonanInitial.'"')
                                                ->whereRaw('substr(x1.nomorPermohonan,10,10)="'.$genNoPermohonanTimestamp.'"')
                                                ->orderBy('id', 'desc')
                                                ->skip(0)
                                                ->take(1);
                                        }, 'y1'
                                    );

                                $lastSeqGet = $lastSeqQuery->get()->first();

                                if($lastSeqGet):
                                    $lastSeqGetConvertInt   = (int) $lastSeqGet->lastSeq;
                                else:
                                    $lastSeqGetConvertInt   = 0;
                                endif;
                               
                                $lastSeqGetIncrement    = $lastSeqGetConvertInt+1;
                                $lastSeqSet = str_pad($lastSeqGetIncrement,3,'0',STR_PAD_LEFT);
                                $genNoPermohonan    = $permohonanInitial.$lastSeqSet.'.'.$genNoPermohonanTimestamp;

    	                        $dataprepcv = new Kelahiran2Model([
    		                        'nomorPermohonan'	=> $genNoPermohonan,
                                    'pemohon_nik'   => $pemohonnik,
                                    'pemohon_nama'  => $pemohonnama,
                                    'pemohon_kk'    => $pemohonkk,
                                    'pemohon_hp'    => $pemohonhp,
                                    'pemohon_email' => $pemohonemail,
                                    'biodata_anakNik'   => $nikbayi,
                                    'biodata_anakNama'  => $namalengkap,
                                    'biodata_anakJenisKelamin'  => $jeniskelamin,
                                    'biodata_anakTanggalLahir'  => $tgllahir,
                                    'biodata_ayahNik'   => $nikayah,
                                    'biodata_ayahNama'  => $namaayah,
                                    'biodata_ayahPekerjaan' => $pekerjaan,
                                    'biodata_ibuNik'    => $nikibu,
                                    'biodata_ibuNama'   => $namaibu,
                                    'dataKelahiran_anakKe'  => $anakke,
                                    'dataKelahiran_tmptDilahirkan'  => $tempatdilahirkan,
                                    'dataKelahiran_tmptKelahiran'   => $tempatkelahiran,
                                    'dataKelahiran_jamKelahiran'    => $jamkelahiran,
                                    'dataKelahiran_jenisKelahiran'  => $jeniskelahiran,
                                    'dataKelahiran_berat'   => $berat,
                                    'dataKelahiran_panjang' => $panjang,
                                    'dataKelahiran_penolong'=> $penolong,
                                    'saksi1_nik'=> $niksaksi1,
                                    'saksi1_nama'   => $namasaksi1,
                                    'saksi2_nik'=> $niksaksi2,
                                    'saksi2_nama'   => $namasaksi2,
                                    'catatan_detail'=> $catatan,
                                    'syaratDok_bukuNikah'   => isset($filebukunikahx)?'uploads/'.$permohonanType.'/'.$genNoPermohonan.'/'.$filebukunikahx:'',
                                    'syaratDok_KK'  => isset($filekkx)?'uploads/'.$permohonanType.'/'.$genNoPermohonan.'/'.$filekkx:'',
                                    'syaratDok_keteranganLahir'     => isset($fileketeranganlahirx)?'uploads/'.$permohonanType.'/'.$genNoPermohonan.'/'.$fileketeranganlahirx:'',
                                    'syaratDok_ktpsaksi1'   => isset($filektpsaksi1x)?'uploads/'.$permohonanType.'/'.$genNoPermohonan.'/'.$filektpsaksi1x:'',
                                    'syaratDok_ktpsaksi2'   => isset($filektpsaksi2x)?'uploads/'.$permohonanType.'/'.$genNoPermohonan.'/'.$filektpsaksi2x:'',
                                    'syaratDok_ktpayah'     => isset($filektpayahx)?'uploads/'.$permohonanType.'/'.$genNoPermohonan.'/'.$filektpayahx:'',
                                    'syaratDok_ktpibu'      => isset($filektpibux)?'uploads/'.$permohonanType.'/'.$genNoPermohonan.'/'.$filektpibux:'',
                                    'syaratDok_pendukung1'  => isset($filependukung1x)?'uploads/'.$permohonanType.'/'.$genNoPermohonan.'/'.$filependukung1x:'',
                                    'syaratDok_pendukung2'  => isset($filependukung2x)?'uploads/'.$permohonanType.'/'.$genNoPermohonan.'/'.$filependukung2x:'',
                                    'syaratDok_pendukung3'  => isset($filependukung3x)?'uploads/'.$permohonanType.'/'.$genNoPermohonan.'/'.$filependukung3x:'',
                                    'syaratDok_pendukung4'  => isset($filependukung4x)?'uploads/'.$permohonanType.'/'.$genNoPermohonan.'/'.$filependukung4x:'',
                                    'syaratDok_pendukung5'  => isset($filependukung5x)?'uploads/'.$permohonanType.'/'.$genNoPermohonan.'/'.$filependukung5x:'',
                                    'skm_key'   => Hash::make($genNoPermohonan),

                                    'verified_pejabatDesa_status'   => ($sesslvlID==41 || $sesslvlID==4 || $sesslvlID==3 || $sesslvlID==2 || $sesslvlID==1)?'1':'2',
                                    'verified_pejabatDesa_by'       => ($sesslvlID==41 || $sesslvlID==4 || $sesslvlID==3 || $sesslvlID==2 || $sesslvlID==1)?$sessid:null,
                                    'verified_pejabatDesa_date'     => ($sesslvlID==41 || $sesslvlID==4 || $sesslvlID==3 || $sesslvlID==2 || $sesslvlID==1)?Carbon::now():null,
                                    'verified_operatorKec_status'   => ($sesslvlID==41 || $sesslvlID==4 || $sesslvlID==3 || $sesslvlID==2 || $sesslvlID==1)?'1':'2',
                                    'verified_operatorKec_by'       => ($sesslvlID==41 || $sesslvlID==4 || $sesslvlID==3 || $sesslvlID==2 || $sesslvlID==1)?$sessid:null,
                                    'verified_operatorKec_date'     => ($sesslvlID==41 || $sesslvlID==4 || $sesslvlID==3 || $sesslvlID==2 || $sesslvlID==1)?Carbon::now():null,
                                    'verified_operatorCapil_status' => ($sesslvlID==41 || $sesslvlID==4 || $sesslvlID==3 || $sesslvlID==2 || $sesslvlID==1)?'2':null,
                                    'verified_operatorCapil_by'     => ($sesslvlID==41 || $sesslvlID==4 || $sesslvlID==3 || $sesslvlID==2 || $sesslvlID==1)?$sessid:null,
                                    'verified_operatorCapil_date'   => ($sesslvlID==41 || $sesslvlID==4 || $sesslvlID==3 || $sesslvlID==2 || $sesslvlID==1)?Carbon::now():null,
                                    'isEscalateToDinas'=> 1,

                                    'kode_kel'  => $sesskodekel,
                                    'created_by'=> $sessid,
                                    'created_at'=> Carbon::now()
    		                    ]);

    	                        $isExistQuery= Kelahiran2Model::whereIn('progress_status', ['2','3'])->where([['pemohon_nik','=',$pemohonnik],['status','=','1']]);
    	                        if($isExistQuery->count()<=0):
    		                        $savedata   = $dataprepcv->save();

    		                        if($savedata):
                                        if (!file_exists(base_path().'/../../uploads/'.$permohonanType.'/'.$genNoPermohonan)):
                                            $oldmask = umask(0);
                                            mkdir(base_path().'/../../uploads/'.$permohonanType.'/'.$genNoPermohonan, 0777);
                                            umask($oldmask);
                                        endif;

                                        $fileList  = ['filebukunikahx','filekkx','fileketeranganlahirx','filektpsaksi1x','filektpsaksi2x','filektpayahx','filektpibux','filependukung1x','filependukung2x','filependukung3x','filependukung4x','filependukung5x'];
                                        for ($i=0; $i<sizeof($fileList); $i++):
                                            if(${$fileList[$i]}!=''):
                                               rename(base_path().'/../../uploads/tmp/'.${$fileList[$i]},base_path().'/../../uploads/'.$permohonanType.'/'.$genNoPermohonan.'/'.${$fileList[$i]});
                                            endif;
                                        endfor;

                                        $PermohonanData     = Kelahiran2Model::where([['nomorPermohonan',$genNoPermohonan]])->get()->first();
                                        $CreatedBy_UserData = UsersModel::find($PermohonanData->created_by);
                                        $status_permohonan_msg  = '';
                                        $catatan_permohonan_msg = '';
                                        if($sesslvlID==3):
                                            $status_permohonan_msg  = 'Dalam Proses';
                                        elseif($sesslvlID==41):
                                            $status_permohonan_msg  = (($prgsts=='0')?'Ditolak':'Dalam Proses');
                                        elseif($sesslvlID==2 || $sesslvlID==4):
                                            $status_permohonan_msg  = (($prgsts=='0')?'Ditolak':(($prgsts=='1')?'Terverifikasi':'Dalam Proses'));
                                            $catatan_permohonan_msg = (($prgsts=='1')?"\n\n# _*Catatan*_ \n  └ 1. Dokumen digital adminduk akan dikirimkan melalui E-Mail \n  └ 2. KTPel dan KIA, pemohon dapat mengajukan permohonan melalui aplikasi online dan datang ke kantor dinas kependudukan untuk mengambil KTP atau KIA jika permohonan sudah dinyatakan selesai oleh petugas kami dengan membawa dokuman asli (contoh KTP yang rusak, surat kehilangan dll)":"");
                                        endif;
                                        $sendwamsg  = ucfirst(env('APP_SITE_STRUKTUR1'))." ".ucfirst(env('APP_SITE_NAME_FULLNAME'))." - Pelayanan ".ucfirst(env('APP_SITE_TENANT'))."\n\n# _*Ringkasan => ".$PermohonanData->nomorPermohonan."*_ \n  └ Jenis : ".$permohonanKet."\n  └ Dibuat Oleh : ".$CreatedBy_UserData->user_id."\n  └ Pemohon : ".$PermohonanData->pemohon_nama."\n  └ Tgl Permohonan : ".$PermohonanData->created_at."\n\n# _*Status => ".$status_permohonan_msg."*_ \n  └ Operator Capil : ".(($PermohonanData->verified_operatorKec_status=='1' && $PermohonanData->verified_operatorCapil_status=='2')?'Menunggu Verifikasi':(($PermohonanData->verified_operatorCapil_status=='3')?'Terverifikasi & Proses Input SIAK':(($PermohonanData->verified_operatorCapil_status=='0')?'Ditolak':(($PermohonanData->verified_operatorCapil_status=='1')?'Terverifikasi & Selesai':'-')))).(($PermohonanData->verified_operatorKec_status=='0' || $PermohonanData->verified_operatorCapil_status=='0')?"\n\n# _*Alasan*_ \n  └ Detail : ".ucwords($request->get('alasandetail')):"").$catatan_permohonan_msg."\n\n".ucfirst(env('APP_SITE_TENANT'))." ".ucfirst(env('APP_SITE_STRUKTUR1'))." ".ucfirst(env('APP_SITE_NAME_FULLNAME'))." Melayani Sepenuh Hati";
                                        $this->sendwa($sendwamsg,$pemohonhp);
                                        if($pemohonhp!=$CreatedBy_UserData->user_hp): $this->sendwa($sendwamsg,$CreatedBy_UserData->user_hp); endif;
                                        if($sesslvlID==3):
                                            $PejabataDesa_UserData   = UsersModel::selectRaw('user_hp,max(user_id) as user_id')->where([['kode_kel',$sesskodekel],['userlevel_id','5'],['status','=','1']])->groupBy('user_hp')->get();
                                            for ($i=0; $i<count($PejabataDesa_UserData); $i++):
                                                if($pemohonhp!=$PejabataDesa_UserData[$i]['user_hp']): 
                                                    $this->sendwa($sendwamsg,$PejabataDesa_UserData[$i]['user_hp']);
                                                endif;
                                            endfor;
                                        endif;

                                        $output_success[]   = "Info: Data berhasil disimpan\nNo. Permohonan : ".$genNoPermohonan;
                                        $output_data[]  = $genNoPermohonan;
    		                        else:
    		                        	$output_error[] = 'Info: Data tidak berhasil disimpan (N-05)';
    		                        endif;
    		                    else:
    		                        $output_error[]	= 'Info: Data tidak berhasil disimpan, data sudah dalam proses dengan nomor permohonan '.$isExistQuery->get()->first()->nomorPermohonan;
    		                    endif;
    	                    } catch(\Illuminate\Database\QueryException $ex){
    	                        $output_error[]         = 'Info: Data tidak berhasil disimpan (N-03)';
    	                    }
    	                elseif($request->get('act') == "upd"):
                            try {
                                $data = Kelahiran2Model::find($request->get('key'));
                                $data_pemohonhp = $data->pemohon_hp;
                                $data_pemohonnama= $data->pemohon_nama;
                                $datarjkalasan  = OptionModel::where([['option_val','=',$rjkalasan],['option_group','=','rejectReason']])->first();

                                $data->reject_alasan    = $rjkalasan;
                                $data->alasan_detail    = $alasandetail;

                                if($sesslvlID==41):
                                    $data->verified_operatorKec_status  = $prgsts;
                                    $data->verified_operatorKec_by      = $sessid;
                                    $data->verified_operatorKec_date    = Carbon::now();

                                    if($prgsts==0):
                                        $data->progress_status  = $prgsts;
                                        $data->updated_by   = $sessid;
                                        $data->updated_at   = Carbon::now();
                                    endif;
                                elseif($sesslvlID==2 || $sesslvlID==4):
                                    $data->verified_operatorCapil_status= $prgsts;
                                    $data->verified_operatorCapil_by    = $sessid;
                                    $data->verified_operatorCapil_date  = Carbon::now();

                                    if($prgsts==0 || $prgsts==1 || $prgsts==3):
                                        $data->progress_status  = $prgsts;
                                        $data->updated_by   = $sessid;
                                        $data->updated_at   = Carbon::now();
                                    endif;
                                endif;

                                $updatedata = $data->save();
                                if($updatedata):
                                    if($prgsts=='3'):
                                        $this->genLampiran($permohonanType,$data->nomorPermohonan);
                                    endif;

                                    if($prgsts=='0'):
                                        $ListFieldOfTable_init      = new Kelahiran2Model;
                                        $ListFieldOfTable_get       = $ListFieldOfTable_init->getTableColumns();
                                        $ListFieldOfTable_remove    = ['id','nomorPermohonan','progress_status','isEscalateToDinas','verified_pejabatDesa_status','verified_pejabatDesa_by','verified_pejabatDesa_date','verified_operatorKec_status','verified_operatorKec_by','verified_operatorKec_date','verified_operatorCapil_status','verified_operatorCapil_by','verified_operatorCapil_date','catatan_admin','reject_alasan','alasan_detail','evidenceDelete_status','evidenceDelete_by','evidenceDelete_date','skm_key','status','kode_kel','created_by','created_at','updated_by','updated_at'];
                                        $ListFieldOfTable_formated  = array_values(array_flip(array_diff_key(array_flip($ListFieldOfTable_get),array_flip($ListFieldOfTable_remove))));
                                        $datamaskingMass= Kelahiran2Model::find($request->get('key'));
                                        for ($i=0; $i<count($ListFieldOfTable_formated); $i++):
                                            ${'datamaskingMass'}->{$ListFieldOfTable_formated[$i]}  = null;
                                        endfor;
                                        $updMaskingMass = $datamaskingMass->save();
                                    endif;

                                    $CreatedBy_UserData  = UsersModel::find($data->created_by);
                                    $status_permohonan_msg  = '';
                                    $catatan_permohonan_msg = '';
                                    if($sesslvlID==41):
                                        $status_permohonan_msg  = (($prgsts=='0')?'Ditolak':'Dalam Proses');
                                    elseif($sesslvlID==2 || $sesslvlID==4):
                                        $status_permohonan_msg  = (($prgsts=='0')?'Ditolak':(($prgsts=='1')?'Terverifikasi':'Dalam Proses'));
                                        $catatan_permohonan_msg = (($prgsts=='1')?"\n\n# _*Catatan*_ \n  └ 1. Dokumen digital adminduk akan dikirimkan melalui E-Mail \n  └ 2. KTPel dan KIA, pemohon dapat mengajukan permohonan melalui aplikasi online dan datang ke kantor dinas kependudukan untuk mengambil KTP atau KIA jika permohonan sudah dinyatakan selesai oleh petugas kami dengan membawa dokuman asli (contoh KTP yang rusak, surat kehilangan dll)":"");
                                    endif;
                                    $sendwamsg  = ucfirst(env('APP_SITE_STRUKTUR1'))." ".ucfirst(env('APP_SITE_NAME_FULLNAME'))." - Pelayanan ".ucfirst(env('APP_SITE_TENANT'))."\n\n# _*Ringkasan => ".$data->nomorPermohonan."*_ \n  └ Jenis : ".$permohonanKet."\n  └ Dibuat Oleh : ".$CreatedBy_UserData->user_id."\n  └ Pemohon : ".$data->pemohon_nama."\n  └ Tgl Permohonan : ".$data->created_at."\n\n# _*Status => ".$status_permohonan_msg."*_ \n  └ Operator Capil : ".(($data->verified_operatorKec_status=='1' && $data->verified_operatorCapil_status=='2')?'Menunggu Verifikasi':(($data->verified_operatorCapil_status=='3')?'Terverifikasi & Proses Input SIAK':(($data->verified_operatorCapil_status=='0')?'Ditolak':(($data->verified_operatorCapil_status=='1')?'Terverifikasi & Selesai':'-')))).(($data->verified_operatorKec_status=='0' || $data->verified_operatorCapil_status=='0')?"\n\n# _*Alasan*_ \n  └ Detail : ".ucwords($request->get('alasandetail')):"").$catatan_permohonan_msg."\n\n".ucfirst(env('APP_SITE_TENANT'))." ".ucfirst(env('APP_SITE_STRUKTUR1'))." ".ucfirst(env('APP_SITE_NAME_FULLNAME'))." Melayani Sepenuh Hati";
                                    $this->sendwa($sendwamsg,$data_pemohonhp);                            
                                    if($data_pemohonhp!=$CreatedBy_UserData->user_hp): $this->sendwa($sendwamsg,$CreatedBy_UserData->user_hp); endif;

                                    $output_success[]   = 'Info: Berhasil memperbaharui data...';
                                else:
                                    $output_error[] = 'Info: Data tidak berhasil diperbaharui (N-05)';
                                endif;
                            } catch(\Illuminate\Database\QueryException $ex){
                                $output_error[]         = 'Info: Data tidak berhasil diperbaharui (Err04)...';
                            }
                        endif;
    	            else:
    	                $output_error[] = 'Info: Harap refresh browser dan login kembali (N-01)';
                    endif;
                endif;
            } catch (Exception $e) {
                $output_error[] = 'Info: Data tidak berhasil disimpan (N-00)';
            }
        else:
            $output_error[] = 'Info: Harap dicoba kembali (N-00-'.$recaptchaRes->toArray()['score'].')';
        endif;

        $output = array('error' => $output_error,'success' => $output_success,'data' => $output_data,'html' => $output_html);
        echo json_encode($output);
    }

    public function sendwa($msg,$hp) {
        $curl   = curl_init();
        $token  = "G1wfTLSJYCQNAROAU3IZJzD5tfYPPiPAI3vuwXsf2ktIo0omz2qG1Wyfa7wcVNJo.HCKKUQTq";
        $data   = [
            'phone'     => $hp,
            'message'   => $msg,
            'secret'    => true,
            'priority'  => true,
        ];

        curl_setopt($curl, CURLOPT_HTTPHEADER,
            array(
                "Authorization: $token",
            )
        );

        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($data));
        curl_setopt($curl, CURLOPT_URL, "https://solo.wablas.com/api/send-message");
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0);
        $result = curl_exec($curl);
        curl_close($curl);
    }

    function fetchDatas(Request $request) 
    {   
        $key    = $request->input('key');
        $prm1   = $request->input('prm1');
        $nomorPermohonan= $request->input('prm2');

        $data   = Kelahiran2Model::where([['nomorPermohonan','=',$nomorPermohonan]])->get()->first();
        $output = array(
            'permohonanid'   => $data->nomorPermohonan
            ,'pemohonnik'   => $data->pemohon_nik
            ,'pemohonnama'  => $data->pemohon_nama
            ,'pemohonkk'    => $data->pemohon_kk
            ,'pemohonhp'    => $data->pemohon_hp
            ,'pemohonemail' => $data->pemohon_email
            ,'nikbayi'  => $data->biodata_anakNik
            ,'anakNama' => $data->biodata_anakNama
            ,'anakJenisKelamin' => $data->biodata_anakJenisKelamin
            ,'anakTanggalLahir' => $data->biodata_anakTanggalLahir
            ,'ayahNik'  => $data->biodata_ayahNik
            ,'ayahNama' => $data->biodata_ayahNama
            ,'ayahPekerjaan'=> $data->biodata_ayahPekerjaan
            ,'ibuNik'   => $data->biodata_ibuNik
            ,'ibuNama'  => $data->biodata_ibuNama
            ,'anakKe'   => $data->dataKelahiran_anakKe
            ,'tmptDilahirkan' => $data->dataKelahiran_tmptDilahirkan
            ,'tmptKelahiran'  => $data->dataKelahiran_tmptKelahiran
            ,'jamKelahiran'   => $data->dataKelahiran_jamKelahiran
            ,'jenisKelahiran' => $data->dataKelahiran_jenisKelahiran
            ,'berat'  => $data->dataKelahiran_berat
            ,'panjang'=> $data->dataKelahiran_panjang
            ,'penolong'   => $data->dataKelahiran_penolong
            ,'niksaksi1'   => $data->saksi1_nik
            ,'namasaksi1'  => $data->saksi1_nama
            ,'niksaksi2'   => $data->saksi2_nik
            ,'namasaksi2'  => $data->saksi2_nama
            ,'catatan'   => ($data->catatan_detail)?$data->catatan_detail:'-'
            ,'filebukunikah'  => $data->syaratDok_bukuNikah
            ,'filekk' => $data->syaratDok_KK
            ,'fileketeranganlahir'    => $data->syaratDok_keteranganLahir
            ,'filektpsaksi1'=> $data->syaratDok_ktpsaksi1
            ,'filektpsaksi2'=> $data->syaratDok_ktpsaksi2
            ,'filektpayah'  => $data->syaratDok_ktpayah
            ,'filektpibu'   => $data->syaratDok_ktpibu
            ,'filependukung1'   => $data->syaratDok_pendukung1
            ,'filependukung2'   => $data->syaratDok_pendukung2
            ,'filependukung3'   => $data->syaratDok_pendukung3
            ,'filependukung4'   => $data->syaratDok_pendukung4
            ,'filependukung5'   => $data->syaratDok_pendukung5
            ,'prgsts'=> $data->progress_status
            ,'rjkalasan'=> $data->reject_alasan
            ,'rjkdetil' => $data->alasan_detail
            ,'sts'   => $data->status
            ,'key'   => $key
        );

        echo json_encode($output);
    }

    public function upload(Request $request)
    {   
        $output_error   = array();
        $output_success = array();
        $output_data    = array();
        $output_html    = array();

        if($request->hasFile($request->get('typeset'))):
            $validation = Validator::make(
                $request->all()
                ,[
                    $request->get('typeset').''=> 'required|mimes:png,jpg,jpeg|max:2048'
                ]
                ,[
                    $request->get('typeset').'.mimes'  => 'Jenis File Diizinkan : PNG / JPG / JPEG',
                    $request->get('typeset').'.max'    => 'Ukuran Max File Diizinkan : 2MB'
                ]
            );

            if($validation->fails()):
                foreach($validation->messages()->getMessages() as $field_name => $messages):
                    $output_error[] = $messages;
                endforeach;
            else:
                try{
                    $file       = $request->file($request->get('typeset'));
                    $filename   = $file->getClientOriginalName();
                    $extension  = $file->getClientOriginalExtension();
                    $filenamename   = now()->timestamp.'_'.$request->get('uid').'_'.$request->get('groupset').'_'.uniqid().'.'.$extension;

                    $file->move(base_path().'/../../uploads/tmp',$filenamename);

                    $output_success[]   = $filenamename;
                }catch(\Exception $e){
                    $output_error[] = 'File gagal di upload (N-01)';
                }
            endif;
        endif;

        $output = array('error' => $output_error,'success' => $output_success,'data' => $output_data,'html' => $output_html);
        echo json_encode($output);
    }

    public function genPDF($permohonanType,$permohonanID) {
        $data   = Kelahiran2Model::where([['nomorPermohonan','=',$permohonanID]])->get()->first();
        $data_jenkel    = OptionModel::where([['option_val','=',$data->biodata_anakJenisKelamin],['option_group','=','jenkel'],['status','=','1']])->get()->first();
        $data_kelahiranTempatdilahirkan  = OptionModel::where([['option_val','=',$data->dataKelahiran_tmptDilahirkan],['option_group','=','kelahiranTempatdilahirkan'],['status','=','1']])->get()->first();
        $data_kelahiranJenisKelahiran    = OptionModel::where([['option_val','=',$data->dataKelahiran_jenisKelahiran],['option_group','=','kelahiranJenisKelahiran'],['status','=','1']])->get()->first();
        $data_kelahiranPenolong    = OptionModel::where([['option_val','=',$data->dataKelahiran_penolong],['option_group','=','kelahiranPenolong'],['status','=','1']])->get()->first();
        $output = array(
            'permohonanid'  => $data->nomorPermohonan
            ,'pemohonnik'   => $data->pemohon_nik
            ,'pemohonnama'  => $data->pemohon_nama
            ,'pemohonkk'    => $data->pemohon_kk
            ,'pemohonhp'    => $data->pemohon_hp
            ,'pemohonemail' => $data->pemohon_email
            ,'nikbayi'  => $data->biodata_anakNik
            ,'anakNama' => $data->biodata_anakNama
            ,'anakJenisKelamin' => $data_jenkel->option_name
            ,'anakTanggalLahir' => $data->biodata_anakTanggalLahir
            ,'ayahNik'  => $data->biodata_ayahNik
            ,'ayahNama' => $data->biodata_ayahNama
            ,'ayahPekerjaan'=> $data->biodata_ayahPekerjaan
            ,'ibuNik'   => $data->biodata_ibuNik
            ,'ibuNama'  => $data->biodata_ibuNama
            ,'anakKe'   => $data->dataKelahiran_anakKe
            ,'tmptDilahirkan'   => $data_kelahiranTempatdilahirkan->option_name
            ,'tmptKelahiran'    => $data->dataKelahiran_tmptKelahiran
            ,'jamKelahiran'     => $data->dataKelahiran_jamKelahiran
            ,'jenisKelahiran'   => $data_kelahiranJenisKelahiran->option_name
            ,'berat'    => $data->dataKelahiran_berat
            ,'panjang'  => $data->dataKelahiran_panjang
            ,'penolong'     => $data_kelahiranPenolong->option_name
            ,'niksaksi1'    => $data->saksi1_nik
            ,'namasaksi1'   => $data->saksi1_nama
            ,'niksaksi2'    => $data->saksi2_nik
            ,'namasaksi2'   => $data->saksi2_nama
            ,'catatan'  => ($data->catatan_detail)?$data->catatan_detail:'-'
            ,'filebukunikah'    => ($data->syaratDok_bukuNikah)?'ADA':'-'
            ,'filekk'   => ($data->syaratDok_KK)?'ADA':'-'
            ,'fileketeranganlahir'    => ($data->syaratDok_keteranganLahir)?'ADA':'-'
            ,'filektpsaksi1'=> ($data->syaratDok_ktpsaksi1)?'ADA':'-'
            ,'filektpsaksi2'=> ($data->syaratDok_ktpsaksi2)?'ADA':'-'
            ,'filektpayah'  => ($data->syaratDok_ktpayah)?'ADA':'-'
            ,'filektpibu'   => ($data->syaratDok_ktpibu)?'ADA':'-'
            ,'filependukung1'   => ($data->syaratDok_pendukung1)?'ADA':'-'
            ,'filependukung2'   => ($data->syaratDok_pendukung2)?'ADA':'-'
            ,'filependukung3'   => ($data->syaratDok_pendukung3)?'ADA':'-'
            ,'filependukung4'   => ($data->syaratDok_pendukung4)?'ADA':'-'
            ,'filependukung5'   => ($data->syaratDok_pendukung5)?'ADA':'-'
            ,'prgsts'   => $data->progress_status
            ,'rjkalasan'=> $data->reject_alasan
            ,'rjkdetil' => $data->alasan_detail
            ,'sts'      => $data->status
        );
        
        $pdf = \PDF::loadView('fronts.permohonans.aktakelahiranNikAdaPDF', $output);
        $pdf->save(base_path().'/../../uploads/'.$permohonanType.'/'.$permohonanID.'/'.$permohonanID.'.pdf');

        return $pdf->download($permohonanID);
    }

    public function genLampiran($permohonanType,$permohonanID) {
        $this->genPDF($permohonanType,$permohonanID);
        $pathdir= base_path().'/../../uploads/'.$permohonanType.'/'.$permohonanID;
        if (file_exists($pathdir.'/'.$permohonanID.'.zip')):
            File::delete($pathdir.'/'.$permohonanID.'.zip');
        endif;
        $zip    = Zip::create($pathdir.'/'.$permohonanID.'.zip');
        $zip->add($pathdir);

        return true;
    }
}
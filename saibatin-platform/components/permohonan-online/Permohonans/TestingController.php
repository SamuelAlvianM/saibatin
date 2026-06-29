<?php

namespace App\Http\Controllers\Fronts\Permohonans;

use App\Http\Controllers\Controller;
use App\Models\Imports\BiodataWNILcModel;

use Validator;
use DB;
use Auth;
use Exception;
use Carbon\Carbon;
use App\Quotation;
use Illuminate\Http\Request;

class TestingController extends Controller
{   
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function sv($getdatas) {
        try {
            $setdata= array();
            foreach ($getdatas as $getkey => $getdata):
                if(!empty($getdata)):
                    $tempdata   = array();
                    $tempdata['urut'] = $getdata->urut;
                    $tempdata['nik']  = $getdata->nik;
                    $tempdata['no_ktp'] = $getdata->no_ktp;
                    $tempdata['tmpt_sbl'] = $getdata->tmpt_sbl;
                    $tempdata['no_paspor']  = $getdata->no_paspor;
                    $tempdata['tgl_akh_paspor'] = $getdata->tgl_akh_paspor;
                    $tempdata['nama_lgkp']  = $getdata->nama_lgkp;
                    $tempdata['jenis_klmin']  = $getdata->jenis_klmin;
                    $tempdata['tmpt_lhr'] = $getdata->tmpt_lhr;
                    $tempdata['tgl_lhr']  = $getdata->tgl_lhr;
                    $tempdata['akta_lhr'] = $getdata->akta_lhr;
                    $tempdata['no_akta_lhr']  = $getdata->no_akta_lhr;
                    $tempdata['gol_drh']  = $getdata->gol_drh;
                    $tempdata['agama']  = $getdata->agama;
                    $tempdata['stat_kwn'] = $getdata->stat_kwn;
                    $tempdata['akta_kwn'] = $getdata->akta_kwn;
                    $tempdata['no_akta_kwn']  = $getdata->no_akta_kwn;
                    $tempdata['tgl_kwn']  = $getdata->tgl_kwn;
                    $tempdata['akta_crai']  = $getdata->akta_crai;
                    $tempdata['no_akta_crai'] = $getdata->no_akta_crai;
                    $tempdata['tgl_crai'] = $getdata->tgl_crai;
                    $tempdata['stat_hbkel'] = $getdata->stat_hbkel;
                    $tempdata['klain_fsk']  = $getdata->klain_fsk;
                    $tempdata['pnydng_cct'] = $getdata->pnydng_cct;
                    $tempdata['pddk_akh'] = $getdata->pddk_akh;
                    $tempdata['jenis_pkrjn']  = $getdata->jenis_pkrjn;
                    $tempdata['nik_ibu']  = $getdata->nik_ibu;
                    $tempdata['nama_lgkp_ibu']  = $getdata->nama_lgkp_ibu;
                    $tempdata['nik_ayah'] = $getdata->nik_ayah;
                    $tempdata['nama_lgkp_ayah'] = $getdata->nama_lgkp_ayah;
                    $tempdata['nama_ket_rt']  = $getdata->nama_ket_rt;
                    $tempdata['nama_ket_rw']  = $getdata->nama_ket_rw;
                    $tempdata['nama_pet_reg'] = $getdata->nama_pet_reg;
                    $tempdata['nip_pet_reg']  = $getdata->nip_pet_reg;
                    $tempdata['nama_pet_entri'] = $getdata->nama_pet_entri;
                    $tempdata['nip_pet_entri']  = $getdata->nip_pet_entri;
                    $tempdata['tgl_entri']  = $getdata->tgl_entri;
                    $tempdata['no_kk']  = $getdata->no_kk;
                    $tempdata['jenis_bntu'] = $getdata->jenis_bntu;
                    $tempdata['no_prop']  = $getdata->no_prop;
                    $tempdata['no_kab'] = $getdata->no_kab;
                    $tempdata['no_kec'] = $getdata->no_kec;
                    $tempdata['no_kel'] = $getdata->no_kel;
                    $tempdata['stat_hidup'] = $getdata->stat_hidup;
                    $tempdata['tgl_ubah'] = $getdata->tgl_ubah;
                    $tempdata['tgl_cetak_ktp']  = $getdata->tgl_cetak_ktp;
                    $tempdata['tgl_ganti_ktp']  = $getdata->tgl_ganti_ktp;
                    $tempdata['tgl_pjg_ktp']  = $getdata->tgl_pjg_ktp;
                    $tempdata['stat_ktp'] = $getdata->stat_ktp;
                    $tempdata['als_numpang']  = $getdata->als_numpang;
                    $tempdata['pflag']  = $getdata->pflag;
                    $tempdata['cflag']  = $getdata->cflag;
                    $tempdata['sync_flag']  = $getdata->sync_flag;
                    $tempdata['ket_agama']  = $getdata->ket_agama;
                    $tempdata['kebangsaan'] = $getdata->kebangsaan;
                    $tempdata['gelar']  = $getdata->gelar;
                    $tempdata['ket_pkrjn']  = $getdata->ket_pkrjn;
                    $tempdata['glr_agama']  = $getdata->glr_agama;
                    $tempdata['glr_akademis'] = $getdata->glr_akademis;
                    $tempdata['glr_bangsawan']  = $getdata->glr_bangsawan;
                    $tempdata['is_pros_datang'] = $getdata->is_pros_datang;
                    $tempdata['desc_pekerjaan'] = $getdata->desc_pekerjaan;
                    $tempdata['desc_kepercayaan'] = $getdata->desc_kepercayaan;
                    $tempdata['flag_status']  = $getdata->flag_status;
                    $tempdata['count_ktp']  = $getdata->count_ktp;
                    $tempdata['count_biodata']  = $getdata->count_biodata;
                    $tempdata['flagsink'] = $getdata->flagsink;
                    $tempdata['created_by'] = $getdata->created_by;
                    $tempdata['modified_by']  = $getdata->modified_by;
                    $tempdata['flag_pindah']  = $getdata->flag_pindah;
                    $tempdata['ektp_current_status_code'] = $getdata->ektp_current_status_code;
                    $tempdata['ektp_created_date']  = $getdata->ektp_created_date;
                    $tempdata['ektp_created_by']  = $getdata->ektp_created_by;
                    $tempdata['ektp_updated_date']  = $getdata->ektp_updated_date;
                    $tempdata['ektp_updated_by']  = $getdata->ektp_updated_by;
                    $tempdata['ektp_upload_location'] = $getdata->ektp_upload_location;
                    $tempdata['ektp_batch'] = $getdata->ektp_batch;
                    $tempdata['sms_phone']  = $getdata->sms_phone;
                    $tempdata['sms_count']  = $getdata->sms_count;
                    $tempdata['sumber'] = $getdata->sumber;
                    $tempdata['tgl_cut_off']  = $getdata->tgl_cut_off;
                    $tempdata['sep']  = $getdata->sep;
                    $tempdata['nik_ektp'] = $getdata->nik_ektp;
                    $tempdata['no_kk_ektp'] = $getdata->no_kk_ektp;
                    $tempdata['nama_lgkp_ektp'] = $getdata->nama_lgkp_ektp;
                    $tempdata['jenis_klmin_ektp'] = $getdata->jenis_klmin_ektp;
                    $tempdata['tmpt_lhr_ektp']  = $getdata->tmpt_lhr_ektp;
                    $tempdata['tgl_lhr_ektp'] = $getdata->tgl_lhr_ektp;
                    $tempdata['no_akta_lhr_ektp'] = $getdata->no_akta_lhr_ektp;
                    $tempdata['stat_hbkel_ektp']  = $getdata->stat_hbkel_ektp;
                    $tempdata['pddk_akh_ektp']  = $getdata->pddk_akh_ektp;
                    $tempdata['jenis_pkrjn_ektp'] = $getdata->jenis_pkrjn_ektp;
                    $tempdata['nama_lgkp_ibu_ektp'] = $getdata->nama_lgkp_ibu_ektp;
                    $tempdata['nama_lgkp_ayah_ektp']  = $getdata->nama_lgkp_ayah_ektp;
                    $tempdata['tgl_entri_ektp'] = $getdata->tgl_entri_ektp;
                    $tempdata['tgl_ubah_ektp']  = $getdata->tgl_ubah_ektp;
                    $tempdata['created_ektp'] = $getdata->created_ektp;
                    $tempdata['no_prop_ektp'] = $getdata->no_prop_ektp;
                    $tempdata['no_kab_ektp']  = $getdata->no_kab_ektp;
                    $tempdata['no_kec_ektp']  = $getdata->no_kec_ektp;
                    $tempdata['no_kel_ektp']  = $getdata->no_kel_ektp;
                    $tempdata['nama_kel_ektp']  = $getdata->nama_kel_ektp;
                    $tempdata['nama_kec_ektp']  = $getdata->nama_kec_ektp;
                    $tempdata['nama_kab_ektp']  = $getdata->nama_kab_ektp;
                    $tempdata['nama_prop_ektp'] = $getdata->nama_prop_ektp;
                    $tempdata['current_status_code_ektp'] = $getdata->current_status_code_ektp;
                    $tempdata['flag_ektp']  = $getdata->flag_ektp;
                    $tempdata['skor_nama']  = $getdata->skor_nama;
                    $tempdata['skor_tgl_lhr'] = $getdata->skor_tgl_lhr;
                    $tempdata['skor_tmpt_lhr']  = $getdata->skor_tmpt_lhr;
                    $tempdata['skor_ibu'] = $getdata->skor_ibu;
                    $tempdata['skor_ayah']  = $getdata->skor_ayah;
                    $tempdata['no_prop_o']  = $getdata->no_prop_o;
                    $tempdata['no_kab_o'] = $getdata->no_kab_o;
                    $tempdata['no_kec_o'] = $getdata->no_kec_o;
                    $tempdata['no_kel_o'] = $getdata->no_kel_o;
                    $tempdata['is_crud']  = $getdata->is_crud;
                    $tempdata['current_status_code']  = $getdata->current_status_code;
                    $tempdata['nama_pet_ubah']  = $getdata->nama_pet_ubah;
                    $tempdata['is_upt'] = $getdata->is_upt;
                    $tempdata['cert_status_ktp']  = $getdata->cert_status_ktp;
                    $tempdata['cert_code_ktp']  = $getdata->cert_code_ktp;
                    $tempdata['cert_status_kia']  = $getdata->cert_status_kia;
                    $tempdata['cert_code_kia']  = $getdata->cert_code_kia;
                    $tempdata['cert_status']  = $getdata->cert_status;
                    $tempdata['cert_code']  = $getdata->cert_code;
                    $tempdata['email']  = $getdata->email;
                    $tempdata['cert_code_surket'] = $getdata->cert_code_surket;
                    $tempdata['cert_status_surket'] = $getdata->cert_status_surket;
                    $tempdata['cert_status_surket2']  = $getdata->cert_status_surket2;

                    $setdata[]  = $tempdata;
                endif;
            endforeach;

            $setdata_chunks = array_chunk($setdata,1000);

            foreach ($setdata_chunks as $setdata_chunk) {
                BiodataWNILcModel::insert($setdata_chunk);
            }
        } catch(\Illuminate\Database\QueryException $ex){ 
            dd($ex);
        }
    }

    // public function getdata(Request $request)
    // {
    //     $getdatas  = DB::connection('oraclesk')->query()
    //     ->selectRaw('*')
    //     ->fromSub(
    //         function ($query){
    //             $query
    //                 ->from('biodata_wni_202002 as x1')
    //                 ->selectRaw('
    //                     x1.*
    //                 ')
    //                 ->where([
    //                     ['x1.flag_status','=',0]
    //                 ])
    //                 ->skip(0)
    //                 ->take(10);
    //         }, 'y1'
    //     )
    //     ->get();

    //     if(!empty($getdatas)):
    //         $this->sv($getdatas);
    //     endif;
    // }

    public function getdata(Request $request)
    {
        $getdatas  = DB::connection('oraclesk')->query()
        ->selectRaw('*')
        ->fromSub(
            function ($query){
                $query
                    ->from('biodata_wni_202002 as x1')
                    ->selectRaw('
                        x1.*
                    ')
                    ->where([
                        ['x1.flag_status','=',0]
                    ])
                    ->skip(0)
                    ->take(10);
            }, 'y1'
        )
        ->get();

        dd($getdatas);
    }

    public function getusertablesorcl(Request $request)
    {
        $getdatas  = DB::connection('oraclesk')->query()
        ->selectRaw('*')
        ->fromSub(
            function ($query){
                $query
                    ->fromRaw('user_tables')
                    ->selectRaw('
                        table_name
                    ')
                    ->orderBy('table_name', 'DESC');
            }, 'y1'
        );

        dd($getdatas->get()->toJson());
    }

    public function getcolumstablesorcl(Request $request)
    {
        $getdatas  = DB::connection('oraclesk')->query()
        ->selectRaw('*')
        ->fromSub(
            function ($query){
                $query
                    ->fromRaw('all_tab_columns')
                    ->selectRaw('
                        column_name
                        /*  
                            , table_name
                            , data_type
                            , data_length
                        */
                    ')
                    ->where('table_name','=','BIODATA_WNI')
                    ->orderBy('table_name', 'DESC');
            }, 'y1'
        );

        dd($getdatas->get()->toJson());
    }

    public function getmasterdetil(Request $request)
    {
        $getdatas  = DB::connection('oraclesk')->query()
        ->selectRaw('*')
        ->fromSub(
            function ($query){
                $query
                    ->fromRaw('AGAMA_MASTER')
                    ->selectRaw('
                        *
                    ')
                    ->skip(0)
                    ->take(10);
            }, 'y1'
        );

        dd($getdatas->get()->toJson());
    }
}